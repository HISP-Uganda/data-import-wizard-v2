import { Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Badge, Table, Tabs, TabsProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AxiosInstance } from "axios";
import {
    AggConflict,
    convert,
    generateUid,
    groupGoData4Insert,
    IMapping,
    insertTrackerData,
    insertTrackerData38,
    Processed,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import {
    $attributeMapping,
    $attributionMapping,
    $data,
    $enrollmentMapping,
    $goData,
    $goDataOptions,
    $mapping,
    $metadata,
    $optionMapping,
    $organisationUnitMapping,
    $prevGoData,
    $processed,
    $program,
    $programStageMapping,
    $remoteAPI,
    $tokens,
    $version,
} from "../../Store";
import Progress from "../Progress";

import { useLiveQuery } from "dexie-react-hooks";
import { maxBy } from "lodash";
import { CQIDexie } from "../../db";
import { generateExcelData, isFileBasedMapping } from "../../utils/utils";

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

export default function ProgramImportSummary({ db }: { db: CQIDexie }) {
    const engine = useDataEngine();
    const version = useStore($version);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const program = useStore($program);
    const [count, setCount] = useState(0);
    const mapping = useStore($mapping);
    const optionMapping = useStore($optionMapping);
    const attributionMapping = useStore($attributionMapping);
    const tokens = useStore($tokens);
    const prevGoData = useStore($prevGoData);
    const goData = useStore($goData);
    const processed = useStore($processed);
    const remoteAPI = useStore($remoteAPI);
    const referenceData = useStore($goDataOptions);
    const [excelData, setExcelData] = useState<any[]>([]);
    const metadata = useStore($metadata);
    const data = useStore($data);
    const realColumns = mapping.dhis2SourceOptions?.columns || [];

    const responses = useLiveQuery(() => db.trackerResponses.toArray());
    const errors = useLiveQuery(() => db.dataValueErrors.toArray());
    const conflicts = useLiveQuery(() => db.dataValueConflicts.toArray());

    const programStageMapping = useStore($programStageMapping);
    const attributeMapping = useStore($attributeMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const enrollmentMapping = useStore($enrollmentMapping);

    const processRecords = async () => {
        const notProcessed = await db.trackerResponses
            .where({ completed: "false" })
            .toArray();
        if (notProcessed.length === 0) {
            onClose();
        } else {
            for (const { id } of notProcessed) {
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
                                ...data.bundleReport.typeReportMap[
                                    "TRACKED_ENTITY"
                                ].stats,
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
                                ...data.bundleReport.typeReportMap["EVENT"]
                                    .stats,
                                completed: "true",
                                resource: "events",
                                id: id + "events",
                            },
                            {
                                ...data.bundleReport.typeReportMap[
                                    "RELATIONSHIP"
                                ].stats,
                                completed: "true",
                                resource: "relationships",
                                id: id + "relationships",
                            },
                        ],
                        resource: "multiple",
                        ...data.stats,
                    });
                } else if (data && data.status && data.status === "ERROR") {
                    await db.trackerResponses.put({
                        id,
                        completed: "true",
                        children: [],
                        resource: "multiple",
                        ...data.stats,
                    });
                    if (data && data.conflicts && data.conflicts.length > 0) {
                        await db.dataValueConflicts.bulkPut(data.conflicts);
                    }
                    if (
                        data &&
                        data.validationReport &&
                        data.validationReport.errorReports
                    ) {
                        db.dataValueErrors.bulkPut(
                            data.validationReport.errorReports,
                        );
                    }
                    if (
                        data &&
                        data.validationReport &&
                        data.validationReport.warningReports
                    ) {
                        db.dataValueConflicts.bulkPut(
                            data.validationReport.warningReports,
                        );
                    }
                }
            }
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
        },
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

    const columns: ColumnsType<Partial<AggConflict>> = [
        {
            title: "message",
            dataIndex: "message",
            key: "message",
        },
        {
            title: "trackerType",
            dataIndex: "trackerType",
            key: "trackerType",
        },
        {
            title: "uid",
            dataIndex: "uid",
            key: "uid",
        },
        {
            title: "errorCode",
            dataIndex: "errorCode",
            key: "errorCode",
        },
        {
            title: "object",
            dataIndex: "object",
            key: "object",
        },
        {
            title: "value",
            dataIndex: "value",
            key: "value",
        },
        {
            title: "property",
            dataIndex: "property",
            key: "property",
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
                                            (a) => a.completed === "true",
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
        {
            key: "3",
            label: (
                <Badge count={conflicts?.length} offset={[15, -5]}>
                    <Text>Conflicts</Text>
                </Badge>
            ),
            children: (
                <Table
                    columns={columns}
                    dataSource={conflicts}
                    rowKey={(r) =>
                        `${r.uid}${r.errorCode}${r.object}${r.value}${r.property}`
                    }
                    scroll={{ x: 400 }}
                />
            ),
        },
        {
            key: "4",
            label: (
                <Badge count={errors?.length} offset={[15, -5]}>
                    <Text>Errors</Text>
                </Badge>
            ),
            children: (
                <Table
                    columns={columns}
                    dataSource={errors}
                    rowKey={(r) =>
                        `${r.uid}${r.errorCode}${r.object}${r.value}${r.property}`
                    }
                />
            ),
        },
    ];

    const insertData = async (
        api: Partial<{ engine: any; axios: AxiosInstance }>,
        processedData: Processed,
        mapping: Partial<IMapping>,
    ) => {
        if (mapping.isSource) {
            if (mapping.dataSource === "go-data") {
                await groupGoData4Insert(
                    goData,
                    processedData.goData.inserts,
                    processedData.goData.updates,
                    prevGoData,
                    mapping.authentication || {},
                    async (message) => {
                        await db.messages.put({
                            message,
                            id: 1,
                        });
                    },
                    ({ errors, inserts, updates }) => {
                        console.log(errors, inserts, updates);
                    },
                );
                onClose();
            } else if (
                mapping.dataSource &&
                ["csv-line-list", "xlsx-line-list"].indexOf(
                    mapping.dataSource,
                ) !== -1
            ) {
                const allStages =
                    program.programStages?.reduce<Record<string, number>>(
                        (a, b) => {
                            const stageData = maxBy(
                                processedData.processedData,
                                `0-${b.id}-max`,
                            );
                            a[b.id] = stageData?.[`0-${b.id}-max`] ?? 1;
                            return a;
                        },
                        {},
                    ) ?? {};
                await generateExcelData(
                    realColumns,
                    allStages,
                    processedData.processedData,
                );
                onClose();
            }
        } else {
            if (version >= 38) {
                await insertTrackerData38({
                    processedData,
                    mapping,
                    api,
                    onInsert: async (response) => {
                        if (mapping.dhis2DestinationOptions?.async) {
                            try {
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
                            } catch (error) {}
                        } else {
                            const id = generateUid();
                            await db.trackerResponses.put({
                                id,
                                completed: "true",
                                children: [
                                    {
                                        ...response.bundleReport.typeReportMap[
                                            "TRACKED_ENTITY"
                                        ].stats,
                                        completed: "true",
                                        resource: "entities",
                                        id: id + "entities",
                                    },
                                    {
                                        ...response.bundleReport.typeReportMap[
                                            "ENROLLMENT"
                                        ].stats,
                                        completed: "true",
                                        resource: "enrollments",
                                        id: id + "enrollments",
                                    },
                                    {
                                        ...response.bundleReport.typeReportMap[
                                            "EVENT"
                                        ].stats,
                                        completed: "true",
                                        resource: "events",
                                        id: id + "events",
                                    },
                                    {
                                        ...response.bundleReport.typeReportMap[
                                            "RELATIONSHIP"
                                        ].stats,
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
                        db.messages.put({ message, id: 1 }),
                    api,
                    onInsert: (resource, response) => {
                        updateResponse(resource, response);
                    },
                    chunkSize: mapping.chunkSize ?? 100,
                });
            }
        }
    };

    const fetchAndInsert = async () => {
        let insertApi: Partial<{ engine: any; axios: AxiosInstance }> = {};
        let queryApi: Partial<{ engine: any; axios: AxiosInstance }> = {};
        if (mapping.isSource) {
            queryApi = { engine };
            if (remoteAPI) {
                insertApi = { axios: remoteAPI };
            }
        } else {
            insertApi = { engine };
            if (mapping.isCurrentInstance) {
                queryApi = insertApi;
            } else if (remoteAPI) {
                queryApi = { axios: remoteAPI };
            }
        }
        await db.trackerResponses.clear();
        await db.dataValueConflicts.clear();
        await db.dataValueErrors.clear();
        await db.messages.clear();
        onOpen();
        if (mapping.prefetch || isFileBasedMapping(mapping)) {
            await insertData(insertApi, processed, mapping);
        } else {
            await convert({
                afterConversion: async (converted) => {
                    if (
                        mapping.dataSource &&
                        mapping.isSource &&
                        ["csv-line-list", "xlsx-line-list"].indexOf(
                            mapping.dataSource,
                        ) !== -1
                    ) {
                        setExcelData((prev) => [
                            ...prev,
                            ...converted.processedData,
                        ]);
                    } else {
                        await insertData(insertApi, converted, mapping);
                    }
                },
                attributeMapping,
                programStageMapping,
                mapping,
                sourceApi: queryApi,
                destinationApi: insertApi,
                optionMapping: optionMapping,
                enrollmentMapping,
                version,
                additionalParams: {},
                setMessage: async (message) => {
                    await db.messages.put({
                        message,
                        id: 1,
                    });
                },
                organisationUnitMapping,
                goData,
                data,
                tokens,
                program,
                metadata,
                referenceData,
                attributionMapping,
            });

            if (
                mapping.dataSource &&
                mapping.isSource &&
                ["csv-line-list", "xlsx-line-list"].indexOf(
                    mapping.dataSource,
                ) !== -1
            ) {
                setExcelData(excelData);
            }
        }
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
            <Text>Import Summary</Text>
            <Tabs items={items} />
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
