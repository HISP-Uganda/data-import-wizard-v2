import { Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { AxiosInstance } from "axios";
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
    $program,
    $mapping,
    $programStageMapping,
    $programStageUniqueElements,
    $programUniqAttributes,
    $remoteAPI,
    $tokens,
} from "../../Store";

import {
    otherProcessedApi,
    prevGoDataApi,
    processedGoDataDataApi,
    processor,
} from "../../Events";
import { $version } from "../../Store";
import DHIS2Preview from "../previews/TrackerDataPreview";
import GoDataPreview from "../GoDataPreview";
import OtherSystemPreview from "../previews/OtherSystemPreview";
import Progress from "../Progress";
import { processInstances } from "../../utils/utils";

export default function Preview() {
    const version = useStore($version);
    const metadata = useStore($metadata);
    const program = useStore($program);
    const tokens = useStore($tokens);
    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const mapping = useStore($mapping);
    const programStageMapping = useStore($programStageMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const programUniqAttributes = useStore($programUniqAttributes);
    const programStageUniqueElements = useStore($programStageUniqueElements);
    const optionMapping = useStore($optionMapping);
    const goData = useStore($goData);
    const data = useStore($data);
    const [message, setMessage] = useState<string>("");

    const remoteAPI = useStore($remoteAPI);

    const process = async () => {
        processor.reset();
        processedGoDataDataApi.reset();
        onOpen();
        setMessage(() => "Fetching previous data");
        if (mapping.isSource) {
            let instances: {
                trackedEntityInstances: Array<Partial<TrackedEntityInstance>>;
            } = {
                trackedEntityInstances: [],
            };
            if (
                mapping.dhis2SourceOptions?.programStage &&
                mapping.dhis2SourceOptions.programStage.length > 0
            ) {
                const events = await fetchEvents(
                    { engine },
                    mapping.dhis2SourceOptions.programStage,
                    50,
                    mapping.program?.program || ""
                );
                instances = { trackedEntityInstances: events };
            } else {
                instances = await fetchTrackedEntityInstances({
                    api: { engine },
                    program: mapping.program?.program,
                    additionalParams: {},
                    uniqueAttributeValues: [],
                    withAttributes: false,
                    trackedEntityInstances: [],
                });
            }

            const flattened = flattenTrackedEntityInstances(instances, "ALL");

            if (mapping.dataSource === "go-data") {
                const { metadata, prev } = await fetchGoDataData(
                    goData,
                    mapping.authentication || {}
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
                    flattenTrackedEntityInstances(instances, "ALL"),
                    mapping,
                    organisationUnitMapping,
                    attributeMapping,
                    false,
                    optionMapping
                );
                otherProcessedApi.addNewInserts(data);
            }
        } else {
            if (mapping.dataSource === "dhis2-program") {
                let api: Partial<{ engine: any; axios: AxiosInstance }> = {};
                if (mapping.isCurrentInstance) {
                    api = { engine };
                } else if (remoteAPI) {
                    api = { axios: remoteAPI };
                }
                setMessage(() => "Fetching program data");
                await fetchTrackedEntityInstances(
                    {
                        api,
                        program: mapping.program?.remoteProgram,
                        additionalParams: {},
                        uniqueAttributeValues: [],
                        withAttributes: false,
                        trackedEntityInstances: [],
                    },
                    async (trackedEntityInstances) => {
                        processInstances(
                            {
                                engine,
                                trackedEntityInstances,
                                mapping,
                                version,
                                attributeMapping,
                                program,
                                programStageMapping,
                                optionMapping,
                                organisationUnitMapping,
                                programStageUniqueElements,
                                programUniqAttributes,
                                setMessage,
                            },
                            async (data) => {
                                processor.addInstances(
                                    data.trackedEntityInstances
                                );
                                processor.addEnrollments(data.enrollments);
                                processor.addEvents(data.events);
                                processor.addInstanceUpdated(
                                    data.trackedEntityInstanceUpdates
                                );
                                processor.addEventUpdates(data.eventUpdates);
                                processor.addErrors(data.errors);
                                processor.addConflicts(data.conflicts);
                            }
                        );
                    }
                );
            } else if (mapping.dataSource === "go-data") {
                const {
                    params,
                    basicAuth,
                    hasNextLink,
                    headers,
                    password,
                    username,
                    ...rest
                } = mapping.authentication || {};
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
                            {
                                api: { engine },
                                program: mapping.program?.program,
                                additionalParams: {},
                                uniqueAttributeValues: findUniqAttributes(
                                    current,
                                    attributeMapping
                                ),
                                withAttributes: true,
                                trackedEntityInstances: [],
                            },
                            async (trackedEntityInstances) => {
                                const previous = processPreviousInstances({
                                    trackedEntityInstances,
                                    programUniqAttributes,
                                    programStageUniqueElements,
                                    currentProgram: mapping.program?.program,
                                    eventIdIdentifiesEvent: false,
                                    trackedEntityIdIdentifiesInstance: false,
                                });
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
                                    mapping: mapping,
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
                fetchTrackedEntityInstances(
                    {
                        api: { engine },
                        program: mapping.program?.program,
                        additionalParams: {},
                        uniqueAttributeValues: metadata.uniqueAttributeValues,
                        withAttributes: true,
                        trackedEntityInstances:
                            metadata.trackedEntityInstanceIds,
                    },
                    async (trackedEntityInstances) => {
                        const previous = processPreviousInstances({
                            trackedEntityInstances,
                            programUniqAttributes,
                            programStageUniqueElements,
                            currentProgram: mapping.program?.program,
                            eventIdIdentifiesEvent:
                                metadata.trackedEntityInstanceIds.length > 0,
                            trackedEntityIdIdentifiesInstance:
                                metadata.trackedEntityInstanceIds.length > 0,
                        });
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
                            mapping: mapping,
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
            {mapping.isSource ? (
                mapping.dataSource === "go-data" ? (
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
