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
    getLowestLevelParents,
    GODataTokenGenerationResponse,
    IGoDataData,
    makeMetadata,
    postRemote,
    processPreviousInstances,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { chunk } from "lodash";
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
    $remoteOrganisations,
    $tokens,
    conflictsApi,
    dataApi,
    errorsApi,
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
    const tokens = useStore($tokens);
    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($programMapping);
    const programStageMapping = useStore($programStageMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const programUniqAttributes = useStore($programUniqAttributes);
    const programStageUniqueElements = useStore($programStageUniqueElements);
    const remoteOrganisations = useStore($remoteOrganisations);
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
            console.log(programMapping.dhis2Options);
            if (
                programMapping.dhis2Options?.programStage &&
                programMapping.dhis2Options.programStage.length > 0
            ) {
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
                    programMapping,
                    {},
                    [],
                    false
                );

                console.log(instances);
            }

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
                const { inserts, updates, errors, conflicts } = convertToGoData(
                    flattened,
                    organisationUnitMapping,
                    attributeMapping,
                    goData,
                    optionMapping,
                    tokens,
                    prev
                );

                otherProcessedApi.addNewInserts(inserts);
                otherProcessedApi.addUpdates(updates);
                errorsApi.set(errors);
                conflictsApi.set(conflicts);
            } else {
                const data = await convertFromDHIS2(
                    flattenTrackedEntityInstances(instances),
                    programMapping,
                    organisationUnitMapping,
                    attributeMapping,
                    false,
                    optionMapping
                );
                otherProcessedApi.addNewInserts(data);
            }
        } else {
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
                setMessage(() => "Getting auth token");
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
                    const goDataData = await fetchRemote<any[]>(
                        {
                            ...rest,
                            params: {
                                auth: { param: "access_token", value: token },
                            },
                        },
                        `api/outbreaks/${goData.id}/cases`
                    );

                    const metadata = makeMetadata(program, programMapping, {
                        data: goDataData,
                        programStageMapping,
                        attributeMapping,
                        remoteOrganisations,
                        goData,
                        tokens,
                    });
                    for (const current of chunk(goDataData, 25)) {
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
                                    current,
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
                                console.log(processedInstances);
                                processor.addInstances(processedInstances);
                                processor.addEnrollments(enrollments);
                                processor.addEvents(events);
                                processor.addInstanceUpdated(
                                    trackedEntityInstanceUpdates
                                );
                                processor.addEventUpdates(eventUpdates);
                            }
                        );
                    }
                }
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
                        processor.addInstanceUpdated(
                            trackedEntityInstanceUpdates
                        );
                        processor.addEventUpdates(eventUpdates);
                    }
                );
            }
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
