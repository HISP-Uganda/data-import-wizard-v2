import { Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import {
    convertToGoData,
    flattenTrackedEntityInstances,
    GODataTokenGenerationResponse,
    postRemote,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { groupBy } from "lodash";
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
                const data = convertToGoData(
                    trackedEntityInstances,
                    orgUnitMapping,
                    attributeMapping,
                    goData
                );

                const {
                    params,
                    basicAuth,
                    hasNextLink,
                    headers,
                    password,
                    username,
                    ...rest
                } = programMapping.authentication || {};
                try {
                    const response =
                        await postRemote<GODataTokenGenerationResponse>(
                            rest,
                            "api/users/login",
                            {
                                email: username,
                                password,
                            }
                        );

                    if (response) {
                        const token = response.id;
                        for (const goDataCase of data) {
                            try {
                                const { data: res } = await postRemote<any>(
                                    {
                                        ...rest,
                                    },
                                    `api/outbreaks/${goData.id}/cases`,
                                    goDataCase,
                                    {
                                        auth: {
                                            param: "access_token",
                                            value: token,
                                        },
                                    }
                                );
                                console.log(res);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
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
        } else if (
            programMapping.dataSource === "godata" &&
            !programMapping.prefetch
        ) {
            console.log("We seem to be in a wrong place");
        } else {
            const { enrollments, events, trackedEntities } = processed;
            let eventsWithout: string[] = [];
            let enrollmentsWithout: string[] = [];
            const groupedEvents = groupBy(events, "enrollment");
            const groupedEnrollments = groupBy(
                enrollments,
                "trackedEntityInstance"
            );

            if (trackedEntities) {
                const trackedEntityInstances = trackedEntities.flatMap(
                    (entity) => {
                        if (entity.trackedEntityInstance) {
                            const enrollments =
                                groupedEnrollments[
                                    entity.trackedEntityInstance
                                ] || [];

                            const processedEnrollments = enrollments.flatMap(
                                (enrollment) => {
                                    if (enrollment.enrollment) {
                                        const events =
                                            groupedEvents[
                                                enrollment.enrollment
                                            ] || [];
                                        eventsWithout = [
                                            ...eventsWithout,
                                            ...events.flatMap(({ event }) => {
                                                if (event) {
                                                    return event;
                                                }
                                                return [];
                                            }),
                                        ];
                                        return { ...enrollment, events };
                                    }
                                    enrollmentsWithout.push(
                                        enrollment.enrollment || ""
                                    );
                                    return enrollment;
                                }
                            );
                            return {
                                ...entity,
                                enrollments: processedEnrollments,
                            };
                        }
                        return entity;
                    }
                );

                try {
                    const {
                        response: { importSummaries },
                    }: any = await engine.mutate({
                        type: "create",
                        resource: "trackedEntityInstances",
                        data: { trackedEntityInstances },
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            try {
                if (enrollments && enrollments.length > 0) {
                    const response = await engine.mutate({
                        type: "create",
                        resource: "enrollments",
                        data: {
                            enrollments: enrollments.filter(
                                ({ enrollment }) => {
                                    enrollmentsWithout.indexOf(
                                        enrollment || ""
                                    ) !== -1;
                                }
                            ),
                        },
                    });
                    console.log(response);
                }
            } catch (error) {
                console.log(error);
            }
            try {
                if (events && events.length > 0) {
                    const response = await engine.mutate({
                        type: "create",
                        resource: "events",
                        data: {
                            events: events.filter(({ event }) => {
                                eventsWithout.indexOf(event || "") === -1;
                            }),
                        },
                    });
                    console.log(response);
                }
            } catch (error) {
                console.log(error);
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
