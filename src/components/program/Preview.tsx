import { Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import {
    convertFromDHIS2,
    convertToDHIS2,
    convertToGoData,
    fetchEvents,
    fetchGoDataData,
    fetchRemote,
    fetchTrackedEntityInstances,
    findUniqAttributes,
    flattenTrackedEntityInstances,
    GODataTokenGenerationResponse,
    postRemote,
    processPreviousInstances,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { chunk, maxBy } from "lodash";
import { useEffect, useState } from "react";
import {
    $attributeMapping,
    $data,
    $goData,
    $metadata,
    $optionMapping,
    $organisationUnitMapping,
    $processedGoDataData,
    $program,
    $programMapping,
    $programStageMapping,
    $programStageUniqueElements,
    $programUniqAttributes,
    $tokens,
    otherProcessedApi,
    prevGoDataApi,
    processedGoDataDataApi,
    processor,
} from "../../pages/program";
import { $version } from "../../Store";
import DHIS2Preview from "../DHIS2Preview";
import GoDataPreview from "../GoDataPreview";
import OtherSystemPreview from "../OtherSystemPreview";
import Progress from "../Progress";

export default function Preview() {
    const version = useStore($version);
    const metadata = useStore($metadata);
    const program = useStore($program);
    const tokens = useStore($tokens);
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
        processor.reset();
        processedGoDataDataApi.reset();
        onOpen();
        setMessage(() => "Fetching previous data");
        if (programMapping.isSource) {
            let instances: {
                trackedEntityInstances: Array<Partial<TrackedEntityInstance>>;
            } = {
                trackedEntityInstances: [],
            };
            if (
                programMapping.dhis2Options?.programStage &&
                programMapping.dhis2Options.programStage.length > 0
            ) {
                const events = await fetchEvents(
                    { engine },
                    programMapping.dhis2Options.programStage,
                    50,
                    programMapping.program?.program || ""
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
            }

            const flattened = flattenTrackedEntityInstances(instances);

            if (programMapping.dataSource === "go-data") {
                const {
                    params,
                    basicAuth,
                    hasNextLink,
                    headers,
                    password,
                    username,
                    ...rest
                } = programMapping.authentication || {};

                const { metadata, prev } = await fetchGoDataData(
                    goData,
                    programMapping.authentication || {}
                );
                const responseData = convertToGoData(
                    flattened,
                    organisationUnitMapping,
                    attributeMapping,
                    goData,
                    optionMapping,
                    tokens,
                    metadata
                );
                processedGoDataDataApi.set(responseData);
                prevGoDataApi.set(prev);
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
            if (programMapping.dataSource === "go-data") {
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
                    setMessage(() => "Fetching data from go data");
                    let goDataData = await fetchRemote<any[]>(
                        {
                            ...rest,
                            params: {
                                auth: { param: "access_token", value: token },
                            },
                        },
                        `api/outbreaks/${goData.id}/cases`
                    );

                    const labResults = await fetchRemote<any[]>(
                        {
                            ...rest,
                            params: {
                                auth: { param: "access_token", value: token },
                            },
                        },
                        `api/outbreaks/${goData.id}/lab-results/aggregate`
                    );
                    goDataData = goDataData.map((a) => {
                        const allLabResults = labResults.filter(
                            (b) => b.personId === a.id
                        );
                        if (allLabResults.length > 0) {
                            const maxResult = maxBy(allLabResults, "updatedAt");
                            const {
                                dateOfResult,
                                dateSampleDelivered,
                                dateSampleTaken,
                                dateTesting,
                                labName,
                                result,
                                sampleIdentifier,
                                sampleType,
                                status,
                                testType,
                                testedFor,
                            } = maxResult;
                            return {
                                ...a,
                                dateOfResult,
                                dateSampleDelivered,
                                dateSampleTaken,
                                dateTesting,
                                labName,
                                result,
                                sampleIdentifier,
                                sampleType,
                                status,
                                testType,
                                testedFor,
                            };
                        }

                        return a;
                    });
                    const chunkedData = chunk(goDataData, 25);
                    const chunkLength = chunkedData.length;
                    let i = 0;
                    for (const current of chunkedData) {
                        setMessage(
                            () => `Processing batch ${++i} of ${chunkLength}`
                        );
                        await fetchTrackedEntityInstances(
                            { engine },
                            programMapping,
                            {},
                            findUniqAttributes(current, attributeMapping),
                            true,
                            async (trackedEntityInstances) => {
                                const previous = processPreviousInstances(
                                    trackedEntityInstances,
                                    programUniqAttributes,
                                    programStageUniqueElements,
                                    programMapping.program?.program || ""
                                );
                                const {
                                    enrollments,
                                    events,
                                    trackedEntityInstances: processedInstances,
                                    trackedEntityInstanceUpdates,
                                    eventUpdates,
                                    conflicts,
                                    errors,
                                } = await convertToDHIS2({
                                    previousData: previous,
                                    data: current,
                                    mapping: programMapping,
                                    organisationUnitMapping,
                                    attributeMapping,
                                    programStageMapping,
                                    optionMapping,
                                    version,
                                    program,
                                });
                                processor.addInstances(processedInstances);
                                processor.addEnrollments(enrollments);
                                processor.addEvents(events);
                                processor.addInstanceUpdated(
                                    trackedEntityInstanceUpdates
                                );
                                processor.addEventUpdates(eventUpdates);
                                processor.addErrors(errors);
                                processor.addConflicts(conflicts);
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
                            programMapping.program?.program || ""
                        );
                        const {
                            enrollments,
                            events,
                            trackedEntityInstances: processedInstances,
                            trackedEntityInstanceUpdates,
                            eventUpdates,
                            errors,
                            conflicts,
                        } = await convertToDHIS2({
                            previousData: previous,
                            data,
                            mapping: programMapping,
                            organisationUnitMapping,
                            attributeMapping,
                            programStageMapping,
                            optionMapping,
                            version,
                            program,
                        });
                        processor.addInstances(processedInstances);
                        processor.addEnrollments(enrollments);
                        processor.addEvents(events);
                        processor.addInstanceUpdated(
                            trackedEntityInstanceUpdates
                        );
                        processor.addEventUpdates(eventUpdates);
                        processor.addErrors(errors);
                        processor.addConflicts(conflicts);
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
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            {programMapping.isSource ? (
                programMapping.dataSource === "go-data" ? (
                    <GoDataPreview />
                ) : (
                    <OtherSystemPreview />
                )
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
