import { Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import type { TabsProps } from "antd";
import { Badge, Statistic, Table, Tabs } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AggConflict } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { chunk } from "lodash";
import { useEffect, useState } from "react";
import { $processedData } from "../../pages/aggregate";
import Progress from "../Progress";

export default function ImportSummary() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const engine = useDataEngine();
    const processedData = useStore($processedData);
    const [conflicts, setConflicts] = useState<AggConflict[]>([]);
    const [summary, setSummary] = useState<{
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
    }>({ imported: 0, ignored: 0, deleted: 0, updated: 0 });

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

    const insertIntoDataSet = async () => {
        onOpen();
        const allChunks = chunk(processedData, 100);
        let current = 0;
        for (const ch of allChunks) {
            setMessage(
                () => `Inserting chunk of ${++current} of ${allChunks.length}`
            );
            try {
                const {
                    response: { importCount },
                }: any = await engine.mutate({
                    type: "create",
                    resource: "dataValueSets",
                    data: { dataValues: ch },
                    // params: { async: true },
                });

                setSummary(({ imported, deleted, ignored, updated }) => ({
                    ignored: ignored + importCount.ignored,
                    imported: imported + importCount.imported,
                    deleted: deleted + importCount.deleted,
                    updated: updated + importCount.updated,
                }));
            } catch (error: any) {
                const conflicts = error?.details?.response?.conflicts ?? [];
                const importCount = error?.details?.response?.importCount ?? {
                    imported: 0,
                    ignored: 0,
                    deleted: 0,
                    updated: 0,
                };
                setConflicts((prev) => [...prev, ...conflicts]);
                setSummary(({ imported, deleted, ignored, updated }) => ({
                    ignored: ignored + importCount.ignored,
                    imported: imported + importCount.imported,
                    deleted: deleted + importCount.deleted,
                    updated: updated + importCount.updated,
                }));
            }
        }
        onClose();
    };

    useEffect(() => {
        insertIntoDataSet();
        return () => {
            setConflicts(() => []);
            setSummary(() => ({
                imported: 0,
                ignored: 0,
                deleted: 0,
                updated: 0,
            }));
        };
    }, []);

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "Summary",
            children: (
                <Stack
                    direction="row"
                    alignItems="space-between"
                    w="100%"
                    justifyContent="space-between"
                >
                    <Statistic title="Imported" value={summary.imported} />
                    <Statistic title="Updated" value={summary.updated} />
                    <Statistic title="Deleted" value={summary.deleted} />
                    <Statistic title="Ignored" value={summary.ignored} />
                </Stack>
            ),
        },
        {
            key: "2",
            label: (
                <Badge count={conflicts.length} offset={[15, -5]}>
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

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
