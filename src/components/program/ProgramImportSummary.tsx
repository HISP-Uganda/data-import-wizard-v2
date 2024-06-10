import {
    Stack,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import type { TabsProps } from "antd";
import { useDataEngine } from "@dhis2/app-runtime";
import { Badge, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AxiosInstance } from "axios";
import {
    convertFromDHIS2,
    convertToGoData,
    fetchEvents,
    fetchGoDataData,
    fetchTrackedEntityInstances,
    flattenTrackedEntityInstances,
    generateUid,
    groupGoData4Insert,
    insertTrackerData,
    insertTrackerData38,
    postRemote,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { isArray, isObject, uniq } from "lodash";
import { getOr } from "lodash/fp";
import { useEffect, useState } from "react";
import {
    $attributeMapping,
    $goData,
    $optionMapping,
    $organisationUnitMapping,
    $otherProcessed,
    $prevGoData,
    $processed,
    $processedGoDataData,
    $program,
    $mapping,
    $programStageMapping,
    $programStageUniqueElements,
    $programUniqAttributes,
    $remoteAPI,
    $tokens,
} from "../../Store";
import { $version } from "../../Store";
import Progress from "../Progress";
import Superscript from "../Superscript";

import { processInstances } from "../../utils/utils";
import { db } from "../../db";
import { useLiveQuery } from "dexie-react-hooks";

type TrackerAddition = {
    id: string;
    completed: string;
    deleted: number;
    ignored: number;
    created: number;
    updated: number;
    children: Array<{
        id: string;
        completed: string;
        deleted: number;
        ignored: number;
        created: number;
        updated: number;
    }>;
};

export default function ProgramImportSummary() {
    const toast = useToast();
    const engine = useDataEngine();
    const version = useStore($version);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const program = useStore($program);
    const [count, setCount] = useState(0);
    const programStageMapping = useStore($programStageMapping);
    const mapping = useStore($mapping);
    const attributeMapping = useStore($attributeMapping);
    const programUniqAttributes = useStore($programUniqAttributes);
    const programStageUniqueElements = useStore($programStageUniqueElements);
    const optionMapping = useStore($optionMapping);
    const tokens = useStore($tokens);
    const otherProcessed = useStore($otherProcessed);
    const processedGoDataData = useStore($processedGoDataData);
    const prevGoData = useStore($prevGoData);
    const goData = useStore($goData);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const processed = useStore($processed);
    const remoteAPI = useStore($remoteAPI);
    const [message, setMessage] = useState<string>("");
    const [inserted, setInserted] = useState<any[]>([]);
    const [errored, setErrored] = useState<any[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);

    const responses = useLiveQuery(() => db.trackerResponses.toArray());

    const processRecords = async () => {
        const notProcessed = await db.trackerResponses
            .where({ completed: "false" })
            .toArray();
        for (const { id } of notProcessed ?? []) {
            const { data }: any = await engine.query({
                data: {
                    resource: `system/taskSummaries/TRACKER_IMPORT_JOB/${id}`,
                },
            });
            if (data && data.status && ["OK"].indexOf(data.status) !== -1) {
                await db.trackerResponses.put({
                    id,
                    completed: "true",
                    children: [
                        {
                            ...data.bundleReport.typeReportMap["TRACKED_ENTITY"]
                                .stats,
                            completed: "true",
                            resource: "entities",
                            id: id + "entities",
                        },
                        {
                            ...data.bundleReport.typeReportMap["ENROLLMENT"]
                                .stats,
                            completed: "true",
                            resource: "enrollments",
                            id: id + "enrollments",
                        },
                        {
                            ...data.bundleReport.typeReportMap["EVENT"].stats,
                            completed: "true",
                            resource: "events",
                            id: id + "events",
                        },
                        {
                            ...data.bundleReport.typeReportMap["RELATIONSHIP"]
                                .stats,
                            completed: "true",
                            resource: "relationships",
                            id: id + "relationships",
                        },
                    ],
                    resource: "multiple",
                    ...data.stats,
                });
            } else if (data && data.status && data.status === "ERROR") {
            }

            // if (data && data.conflicts && data.conflicts.length > 0) {
            //     await db.dataValueConflicts.bulkPut(data.conflicts);
            // }
        }
    };

    const updateResponse = async (
        resource: string,
        response: {
            conflicts: any[];
            imported: number;
            updated: number;
            deleted: number;
            total: number;
            ignored: number;
        }
    ) => {
        await db.trackerResponses.put({
            id: generateUid(),
            resource,
            completed: "true",
            children: [],
            ignored: response.ignored,
            created: response.imported,
            updated: response.updated,
            deleted: response.deleted,
        });
    };

    const additionColumns: ColumnsType<TrackerAddition> = [
        {
            title: "id",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "resource",
            dataIndex: "resource",
            key: "resource",
        },
        {
            title: "completed",
            dataIndex: "completed",
            key: "completed",
        },
        {
            title: "created",
            dataIndex: "created",
            key: "created",
        },
        {
            title: "updated",
            dataIndex: "updated",
            key: "updated",
        },
        {
            title: "deleted",
            dataIndex: "deleted",
            key: "deleted",
        },
        {
            title: "ignored",
            dataIndex: "ignored",
            key: "ignored",
        },
    ];

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: <Text>Added</Text>,
            children: (
                <Table
                    columns={additionColumns}
                    dataSource={responses}
                    rowKey="id"
                    footer={() => (
                        <Stack direction="row" spacing="5px">
                            <Text>Completed</Text>
                            {responses && (
                                <Text>
                                    {
                                        responses.filter(
                                            (a) => a.completed === "true"
                                        ).length
                                    }
                                </Text>
                            )}

                            <Text>of</Text>
                            {responses && <Text>{responses.length}</Text>}
                        </Stack>
                    )}
                />
            ),
        },
        // {
        //     key: "3",
        //     label: (
        //         <Badge count={conflicts?.length} offset={[15, -5]}>
        //             <Text>Conflicts</Text>
        //         </Badge>
        //     ),
        //     children: (
        //         <Table
        //             columns={columns}
        //             dataSource={conflicts}
        //             rowKey={(r) =>
        //                 `${r.errorCode}${r.object}${r.value}${r.property}`
        //             }
        //         />
        //     ),
        // },
    ];

    const fetchAndInsert = async () => {
        console.log("Thi is the beginning");
        await db.trackerResponses.clear();
        onOpen();
        if (mapping.isSource) {
            if (mapping.dataSource === "dhis2-program") {
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

                if (mapping.prefetch) {
                    const { conflicts, errors, processed } =
                        processedGoDataData;
                    if (processed) {
                        const { updates, inserts } = processed;
                        await groupGoData4Insert(
                            goData,
                            inserts,
                            updates,
                            prevGoData,
                            mapping.authentication || {},
                            setMessage,
                            setInserted,
                            setUpdates,
                            setErrored
                        );
                    }
                } else {
                    const { metadata, prev } = await fetchGoDataData(
                        goData,
                        mapping.authentication || {}
                    );
                    await fetchTrackedEntityInstances(
                        {
                            api: { engine },
                            program: mapping.program?.program,
                            additionalParams: {},
                            uniqueAttributeValues: [],
                            withAttributes: false,
                            trackedEntityInstances: [],
                        },
                        async (trackedEntityInstances, page) => {
                            setMessage(
                                () =>
                                    `Working on page ${page} for tracked entities`
                            );
                            const { processed, errors, conflicts } =
                                convertToGoData(
                                    flattenTrackedEntityInstances(
                                        {
                                            trackedEntityInstances,
                                        },
                                        "ALL"
                                    ),
                                    organisationUnitMapping,
                                    attributeMapping,
                                    goData,
                                    optionMapping,
                                    tokens,
                                    metadata
                                );
                            const { inserts, updates } = processed;
                            await groupGoData4Insert(
                                goData,
                                inserts,
                                updates,
                                prev,
                                mapping.authentication || {},
                                setMessage,
                                setInserted,
                                setUpdates,
                                setErrored
                            );
                        }
                    );
                }
            } else if (mapping.dataSource === "api") {
                const { newInserts } = otherProcessed;
                if (mapping.prefetch && newInserts) {
                    for (const payload of newInserts) {
                        const response = await postRemote<any>(
                            mapping.authentication,
                            "",
                            payload,
                            {}
                        );
                    }
                } else {
                    if (mapping.dhis2SourceOptions?.programStage) {
                        await fetchEvents({
                            api: { engine },
                            programStages:
                                mapping.dhis2SourceOptions.programStage,
                            program: mapping.program?.program || "",
                            pageSize: 50,
                            afterFetch: async (data) => {
                                const actual = await convertFromDHIS2(
                                    data as any,
                                    mapping,
                                    organisationUnitMapping,
                                    attributeMapping,
                                    true,
                                    optionMapping
                                );
                                for (const payload of actual) {
                                    try {
                                        const response = await postRemote<any>(
                                            mapping.authentication,
                                            "",
                                            payload,
                                            {}
                                        );
                                    } catch (error: any) {
                                        toast({
                                            title: "insert Failed",
                                            description: error?.message,
                                            status: "error",
                                            duration: 9000,
                                            isClosable: true,
                                        });
                                    }
                                }
                            },
                            others: {
                                orgUnit:
                                    mapping.dhis2SourceOptions?.ous?.join(
                                        ";"
                                    ) ?? "",
                                fields: "*",
                            },
                        });
                    } else {
                        await fetchTrackedEntityInstances(
                            {
                                api: { engine },
                                program: mapping.program?.program,
                                additionalParams: {},
                                uniqueAttributeValues: [],
                                withAttributes: false,
                                trackedEntityInstances: [],
                            },
                            async (trackedEntityInstances, page) => {
                                setMessage(
                                    () =>
                                        `Working on page ${page} for tracked entities`
                                );
                                const actual = await convertFromDHIS2(
                                    flattenTrackedEntityInstances(
                                        {
                                            trackedEntityInstances,
                                        },
                                        "ALL"
                                    ),
                                    mapping,
                                    organisationUnitMapping,
                                    attributeMapping,
                                    false,
                                    optionMapping
                                );

                                for (const payload of actual) {
                                    try {
                                        const response = await postRemote<any>(
                                            mapping.authentication,
                                            "",
                                            payload,
                                            {}
                                        );
                                    } catch (error: any) {
                                        toast({
                                            title: "insert Failed",
                                            description: error?.message,
                                            status: "error",
                                            duration: 9000,
                                            isClosable: true,
                                        });
                                    }
                                }
                            }
                        );
                    }
                }
            }
        } else if (mapping.dataSource === "dhis2-program") {
            let api: Partial<{ engine: any; axios: AxiosInstance }> = {};
            if (mapping.isCurrentInstance) {
                api = { engine };
            } else {
                api = { axios: remoteAPI };
            }
            if (mapping.prefetch) {
                if (version >= 38) {
                    await insertTrackerData38({
                        processedData: processed,
                        async: mapping.dhis2DestinationOptions?.async ?? false,
                        chunkSize: mapping.chunkSize ?? 100,
                        api,
                        onInsert: async (response) => {
                            if (mapping.dhis2DestinationOptions?.async) {
                                await db.trackerResponses.put({
                                    id: response.response.id,
                                    completed: "false",
                                    created: 0,
                                    deleted: 0,
                                    ignored: 0,
                                    updated: 0,
                                    children: [],
                                    resource: "multiple",
                                });
                                setCount((c) => c + 1);
                            } else {
                                const id = generateUid();
                                await db.trackerResponses.put({
                                    id: generateUid(),
                                    completed: "true",
                                    children: [
                                        {
                                            ...response.bundleReport
                                                .typeReportMap["TRACKED_ENTITY"]
                                                .stats,
                                            completed: "true",
                                            resource: "entities",
                                            id: id + "entities",
                                        },
                                        {
                                            ...response.bundleReport
                                                .typeReportMap["ENROLLMENT"]
                                                .stats,
                                            completed: "true",
                                            resource: "enrollments",
                                            id: id + "enrollments",
                                        },
                                        {
                                            ...response.bundleReport
                                                .typeReportMap["EVENT"].stats,
                                            completed: "true",
                                            resource: "events",
                                            id: id + "events",
                                        },
                                        {
                                            ...response.bundleReport
                                                .typeReportMap["RELATIONSHIP"]
                                                .stats,
                                            completed: "true",
                                            resource: "relationships",
                                            id: id + "relationships",
                                        },
                                    ],
                                    ...response.stats,
                                });
                            }
                        },
                    });
                } else {
                    await insertTrackerData({
                        processedData: processed,
                        callBack: (message: string) =>
                            setMessage(() => message),
                        api,
                        onInsert: (resource, response) => {
                            updateResponse(resource, response);
                        },
                        chunkSize: mapping.chunkSize ?? 100,
                    });
                }
            } else {
                await fetchTrackedEntityInstances(
                    {
                        api,
                        program: mapping.program?.remoteProgram,
                        withAttributes: false,
                        uniqueAttributeValues: [],
                        additionalParams: {},
                        trackedEntityInstances: [],
                    },
                    async (trackedEntityInstances, { pager }) => {
                        setMessage(
                            () =>
                                `Finished fetching page ${pager?.page} of ${pager?.pageCount} from source`
                        );
                        await processInstances(
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
                                await insertTrackerData({
                                    processedData: data,
                                    callBack: (message: string) =>
                                        setMessage(() => message),
                                    api: { engine },
                                    onInsert: () => {},
                                    chunkSize: mapping.chunkSize ?? 500,
                                });
                            }
                        );
                    }
                );
            }
        } else if (mapping.dataSource === "go-data" && !mapping.prefetch) {
            console.log("We seem to be in a wrong place");
        } else {
            await insertTrackerData({
                processedData: processed,
                callBack: (message: string) => setMessage(() => message),
                api: { engine },
                onInsert: () => {},
                chunkSize: mapping.chunkSize ?? 500,
            });
        }
        onClose();
    };

    useEffect(() => {
        fetchAndInsert();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            processRecords();
        }, 2000);

        return () => clearInterval(intervalId);
    }, [count]);
    return (
        <Stack>
            <Tabs items={items} />
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
