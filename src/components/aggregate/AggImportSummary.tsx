import { Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import type { TabsProps } from "antd";
import { Badge, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    AggConflict,
    AggDataValue,
    generateUid,
    Mapping,
} from "data-import-wizard-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useStore } from "effector-react";
import { chunk } from "lodash";
import { useEffect, useState } from "react";
import { CQIDexie } from "../../db";
import { $data, $mapping, $metadata, $processedData } from "../../Store";
import {
    findUniqueDataSetCompletions,
    processAggregateData,
} from "../../utils/utils";
import Progress from "../Progress";

type Addition = {
    id: string;
    completed: string;
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
};

export default function AggImportSummary({ db }: { db: CQIDexie }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const engine = useDataEngine();
    const processedData = useStore($processedData);
    const mapping = useStore($mapping);
    const [count, setCount] = useState(0);
    const data = useStore($data);
    const metadata = useStore($metadata);

    const responses = useLiveQuery(() => db.dataValueResponses.toArray());
    const conflicts = useLiveQuery(() => db.dataValueConflicts.toArray());
    const processRecords = async () => {
        const notProcessed = await db.dataValueResponses
            .where({ completed: "false" })
            .toArray();
        for (const { id } of notProcessed ?? []) {
            const { data }: any = await engine.query({
                data: {
                    resource: `system/taskSummaries/DATAVALUE_IMPORT/${id}`,
                },
            });
            if (data?.importCount) {
                await db.dataValueResponses.put({
                    id,
                    completed: "true",
                    ...data.importCount,
                });
            }
            if (data && data.conflicts && data.conflicts.length > 0) {
                await db.dataValueConflicts.bulkPut(data.conflicts);
            }
        }
    };

    const additionColumns: ColumnsType<Addition> = [
        {
            title: "id",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "completed",
            dataIndex: "completed",
            key: "completed",
        },
        {
            title: "imported",
            dataIndex: "imported",
            key: "imported",
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

    const columns: ColumnsType<AggConflict> = [
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
            title: "errorCode",
            dataIndex: "errorCode",
            key: "errorCode",
        },
        {
            title: "property",
            dataIndex: "property",
            key: "property",
        },
    ];

    const insertCompletions = async (dataValues: any[]) => {
        try {
            const response = await engine.mutate({
                type: "create",
                resource: "completeDataSetRegistrations",
                data: { completeDataSetRegistrations: dataValues },
                params: {
                    async: false,
                },
            });
        } catch (error: any) {
            console.log(error);
        }
    };

    const insertChunk = async (dataValues: AggDataValue[]) => {
        try {
            const { response }: any = await engine.mutate({
                type: "create",
                resource: "dataValueSets",
                data: { dataValues },
                params: {
                    async: mapping.dhis2DestinationOptions?.async ?? false,
                },
            });

            if (mapping.dhis2DestinationOptions?.async) {
                db.dataValueResponses.put({
                    id: response.id,
                    imported: 0,
                    ignored: 0,
                    deleted: 0,
                    updated: 0,
                    completed: "false",
                });
                setCount((c) => c + 1);
            } else {
                const { importCount } = response;
                await db.dataValueResponses.put({
                    id: generateUid(),
                    ...importCount,
                    completed: "true",
                });
            }
        } catch (error: any) {
            const conflicts = error?.details?.response?.conflicts ?? [];
            const importCount = error?.details?.response?.importCount ?? {
                imported: 0,
                ignored: 0,
                deleted: 0,
                updated: 0,
            };
            await db.dataValueConflicts.bulkPut(conflicts);
            await db.dataValueResponses.put({
                id: generateUid(),
                ...importCount,
                completed: "true",
            });
        }
    };

    const insertIntoDataSet = async () => {
        await db.dataValueResponses.clear();
        await db.dataValueConflicts.clear();
        onOpen();
        if (
            mapping.prefetch ||
            [
                "csv-line-list",
                "xlsx-line-list",
                "xlsx-tabular-data",
                "xlsx-form",
            ].includes(mapping.dataSource ?? "")
        ) {
            const completions = findUniqueDataSetCompletions(
                mapping.aggregate?.dataSet ?? "",
                processedData,
            );
            const allChunks = chunk(processedData, mapping.chunkSize);
            let current = 0;
            let complete = 0;
            for (const ch of allChunks) {
                setMessage(
                    () =>
                        `Inserting chunk of ${++current} of ${
                            allChunks.length
                        }`,
                );
                await insertChunk(ch);
            }

            const completionChunks = chunk(completions, mapping.chunkSize);
            for (const ch of completionChunks) {
                setMessage(
                    () =>
                        `Completing chunk of ${++complete} of ${
                            completionChunks.length
                        }`,
                );
                await insertCompletions(ch);
            }
        } else {
            const organisationUnitMapping =
                metadata.destinationOrgUnits.reduce<Mapping>((a, b) => {
                    if (b.source && b.value) a.set(b.value, b);
                    return a;
                }, new Map());
            const attributionMapping =
                metadata.destinationCategories.reduce<Mapping>((a, b) => {
                    if (b.source && b.value) a.set(b.value, b);
                    return a;
                }, new Map());
            const dataMapping = metadata.destinationCategories.reduce<Mapping>(
                (a, b) => {
                    if (b.source && b.value) a.set(b.value, b);
                    return a;
                },
                new Map(),
            );
            await processAggregateData({
                mapping,
                organisationUnitMapping,
                attributionMapping,
                engine,
                data,
                dataCallback: async ({ validData }) => {
                    await insertChunk(validData);
                    const completions = findUniqueDataSetCompletions(
                        mapping.aggregate?.dataSet ?? "",
                        processedData,
                    );
                    await insertCompletions(completions);
                },
                setMessage,
                dataMapping,
            });
        }
        onClose();
    };

    useEffect(() => {
        insertIntoDataSet();
        return () => {};
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            processRecords();
        }, 2000);

        return () => clearInterval(intervalId);
    }, [count]);

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: (
                <Badge count={responses?.length} offset={[15, -5]}>
                    <Text>Added</Text>
                </Badge>
            ),
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
                        `${r.errorCode}${r.object}${r.value}${r.property}`
                    }
                />
            ),
        },
    ];

    return (
        <Stack>
            <Tabs items={items} />
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
