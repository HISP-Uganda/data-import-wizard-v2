import { Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import {
    convertFromDHIS2,
    convertToDHIS2,
    convertToGoData,
    fetchEvents,
    fetchRemote,
    fetchTrackedEntityInstances,
    flattenTrackedEntityInstances,
    GODataTokenGenerationResponse,
    IGoDataData,
    postRemote,
    processPreviousInstances,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import {
    $attributeMapping,
    $data,
    $goData,
    $metadata,
    $optionMapping,
    $organisationUnitMapping,
    $program,
    $programMapping,
    $programStageMapping,
    $programStageUniqueElements,
    $programTypes,
    $programUniqAttributes,
    otherProcessedApi,
    processor,
} from "../../pages/program/Store";
import { $version } from "../../Store";
import DHIS2Preview from "../DHIS2Preview";
import OtherSystemPreview from "../OtherSystemPreview";
import Progress from "../Progress";

export default function Preview() {
    const version = useStore($version);
    const metadata = useStore($metadata);
    const program = useStore($program);
    const { attributes, elements } = useStore($programTypes);

    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($programMapping);
    const programStageMapping = useStore($programStageMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const programUniqAttributes = useStore($programUniqAttributes);
    const programStageUniqueElements = useStore($programStageUniqueElements);
    const optionMapping = useStore($optionMapping);
    const goData = useStore($goData);
    const data = useStore($data);
    const [message, setMessage] = useState<string>("");

    const process = async () => {
        onOpen();
        setMessage(() => "Fetching previous data");
        if (programMapping.isSource) {
            let instances: {
                trackedEntityInstances: Array<Partial<TrackedEntityInstance>>;
            } = {
                trackedEntityInstances: [],
            };
            if (programMapping.dhis2Options?.programStage) {
                const events = await fetchEvents(
                    { engine },
                    programMapping.dhis2Options.programStage,
                    50,
                    programMapping.program || ""
                );
                instances = { trackedEntityInstances: events };
            } else {
                instances = await fetchTrackedEntityInstances(
                    { engine },
                    programMapping
                );
            }

            let actual: any[] = [];

            const flattened = flattenTrackedEntityInstances(instances);

            if (programMapping.dataSource === "godata") {
                const {
                    params,
                    basicAuth,
                    hasNextLink,
                    headers,
                    password,
                    username,
                    ...rest
                } = programMapping.authentication || {};

                const response =
                    await postRemote<GODataTokenGenerationResponse>(
                        rest,
                        "api/users/login",
                        {
                            email: username,
                            password,
                        }
                    );

                const prev = await fetchRemote<Array<Partial<IGoDataData>>>(
                    rest,
                    `api/outbreaks/${goData.id}/cases`,
                    {
                        auth: {
                            param: "access_token",
                            value: response.id,
                            forUpdates: false,
                        },
                    }
                );
                actual = convertToGoData(
                    flattened,
                    organisationUnitMapping,
                    attributeMapping,
                    goData
                );
            } else {
                actual = await convertFromDHIS2(
                    flattenTrackedEntityInstances(instances),
                    programMapping,
                    organisationUnitMapping,
                    attributeMapping,
                    false,
                    optionMapping
                );
            }
            otherProcessedApi.set(actual);
        } else {
            await fetchTrackedEntityInstances(
                { engine },
                programMapping,
                {},
                metadata.uniqueAttributeValues,
                true,
                async (trackedEntityInstances) => {
                    const previous = processPreviousInstances(
                        trackedEntityInstances,
                        programUniqAttributes,
                        programStageUniqueElements,
                        programMapping.program || ""
                    );
                    const {
                        enrollments,
                        events,
                        trackedEntityInstances: processedInstances,
                        trackedEntityInstanceUpdates,
                        eventUpdates,
                    } = await convertToDHIS2(
                        previous,
                        data,
                        programMapping,
                        organisationUnitMapping,
                        attributeMapping,
                        programStageMapping,
                        optionMapping,
                        version,
                        program,
                        elements,
                        attributes
                    );
                    processor.addInstances(processedInstances);
                    processor.addEnrollments(enrollments);
                    processor.addEvents(events);
                    processor.addInstanceUpdated(trackedEntityInstanceUpdates);
                    processor.addEventUpdates(eventUpdates);
                }
            );
        }

        onClose();
    };

    useEffect(() => {
        process();
        return () => {};
    }, []);
    return (
        <Stack>
            {programMapping.isSource ? (
                <OtherSystemPreview />
            ) : (
                <DHIS2Preview />
            )}
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
