import { Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import {
    convertToGoData,
    flattenTrackedEntityInstances,
    TrackedEntityInstance,
} from "diw-utils";
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import {
    $attributeMapping,
    $goData,
    $organisationUnitMapping,
    $processed,
    $programMapping,
    $remoteAPI,
} from "../../pages/program/Store";
import { $version } from "../../Store";
import Progress from "../Progress";

export default function Step7() {
    const engine = useDataEngine();
    const version = useStore($version);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($programMapping);
    const attributeMapping = useStore($attributeMapping);
    const goData = useStore($goData);
    const orgUnitMapping = useStore($organisationUnitMapping);
    const processed = useStore($processed);
    const remoteAPI = useStore($remoteAPI);
    const [found, setFound] = useState<any>([]);
    const [message, setMessage] = useState<string>("");

    const fetchInstances = async (page: number, pageSize: number) => {
        const {
            instances: { trackedEntityInstances },
        }: any = await engine.query({
            instances: {
                resource: "trackedEntityInstances.json",
                params: {
                    pageSize,
                    page,
                    ouMode: "ALL",
                    fields: "*",
                    program: programMapping.program,
                },
            },
        });
        return { trackedEntityInstances } as {
            trackedEntityInstances: TrackedEntityInstance[];
        };
    };

    const fetchAndInsert = async () => {
        onOpen();
        if (programMapping.isSource) {
            if (programMapping.dataSource === "dhis2") {
            } else if (programMapping.dataSource === "godata") {
                const trackedEntityInstances = await fetchInstances(1, 20);
                const data = await convertToGoData(
                    trackedEntityInstances,
                    orgUnitMapping,
                    attributeMapping,
                    goData
                );

                try {
                    const { data: res } = await remoteAPI.post(
                        `api/outbreaks/${goData.id}/cases`,
                        data
                    );
                    console.log(res);
                } catch (error) {
                    console.log(error);
                }
            }
        } else if (programMapping.dataSource === "dhis2") {
            if (remoteAPI) {
                const { data } = await remoteAPI.get<{
                    trackedEntityInstances: Array<TrackedEntityInstance>;
                }>("api/trackedEntityInstances.json", {
                    params: {
                        program: programMapping.remoteProgram,
                        fields: "*",
                        ouMode: "ALL",
                        pageSize: 1,
                        page: 1,
                    },
                });
                setFound(() => flattenTrackedEntityInstances(data));
            }
        } else if (programMapping.dataSource === "godata") {
        } else {
            const { enrollments, events, trackedEntities } = processed;

            if (trackedEntities && trackedEntities.length > 0) {
                const response = await engine.mutate({
                    type: "create",
                    resource: "trackedEntityInstances",
                    data: { trackedEntityInstances: trackedEntities },
                });
            }
            if (enrollments && enrollments.length > 0) {
                const response = await engine.mutate({
                    type: "create",
                    resource: "enrollments",
                    data: { enrollments },
                });
                console.log(response);
            }

            if (events && events.length > 0) {
                const response = await engine.mutate({
                    type: "create",
                    resource: "events",
                    data: { events },
                });
                console.log(response);
            }
        }

        onClose();
    };

    useEffect(() => {
        fetchAndInsert();
    }, []);
    return (
        <Stack>
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
