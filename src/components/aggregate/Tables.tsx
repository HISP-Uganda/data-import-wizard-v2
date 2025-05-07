import { Stack } from "@chakra-ui/react";
import { Select } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { isArray, uniq } from "lodash";
import { useEffect, useState } from "react";
import { Column } from "../../Interfaces";
import { columnTree, processTable } from "../../utils/utils";
export default function Tables({ data }: { data: any[] }) {
    const [columns, setColumns] = useState<string[]>([]);
    const [rows, setRows] = useState<string[]>([]);
    const [properties, setProperties] = useState<{ [key: string]: any }>({});
    const [available, setAvailable] = useState<ColumnsType<any>>([]);
    const [initial, setInitial] = useState<{
        finalColumns: Column[][];
        finalRows: Column[][];
        finalData: any[];
    }>(
        processTable({
            data,
            rows,
            columns,
            aggregation: "count",
            otherColumns: [],
            thresholds: [],
            dimensions: {},
            properties,
            aggregationColumn: "",
        }),
    );

    const real: Array<ColumnsType<any>> = columns.map((a) => {
        return uniq(data.map((d: any) => d[a]))
            .filter((d: any) => !!d)
            .map((d) => {
                return {
                    title: String(d),
                    dataIndex: String(d),
                    key: String(d),
                };
            });
    });

    useEffect(() => {
        setInitial(() =>
            processTable({
                data,
                rows,
                columns,
                aggregation: "count",
                otherColumns: [],
                thresholds: [],
                dimensions: {},
                properties,
                aggregationColumn: "",
            }),
        );
        const allColumns = columnTree(real, properties);
        const othersColumns: ColumnsType<any> = rows.map((d, index) => {
            return {
                title: properties[`${d}.name`] || d,
                dataIndex: String(d),
                key: String(d),
                ellipsis: true,
                fixed: "left",
                width: "auto",
                onCell: (data, index) => {
                    const value = data[String(d)];
                    const obj: any = {
                        flex: 1,
                    };
                    if (index !== undefined) {
                        if (
                            index >= 1 &&
                            initial.finalData[index - 1] &&
                            value === initial.finalData[index - 1][d]
                        ) {
                            obj.rowSpan = 0;
                        } else {
                            for (
                                let i = 0;
                                index + i !== initial.finalData.length &&
                                initial.finalData[index + i] &&
                                value === initial.finalData[index + i][d];
                                i += 1
                            ) {
                                obj.rowSpan = i + 1;
                            }
                        }
                    }
                    return obj;
                },
            };
        });
        setAvailable(() => [
            ...othersColumns,
            ...(allColumns.length > 0 ? allColumns[0] : []),
        ]);
    }, [JSON.stringify({ ...properties, rows, columns })]);

    const handleRowChange = (value: string | string[]) => {
        if (isArray(value)) {
            setRows(() => value);
        }
    };
    const handleColumnChange = (value: string | string[]) => {
        if (isArray(value)) {
            setColumns(() => value);
        }
    };

    return (
        <Stack>
            <Select
                mode="tags"
                placeholder="Please select"
                onChange={handleRowChange}
                style={{ width: "100%" }}
                options={Object.keys(data[0]).map((s) => ({
                    label: s,
                    value: s,
                }))}
                value={rows}
            />
            <Select
                mode="tags"
                placeholder="Please select"
                onChange={handleColumnChange}
                value={columns}
                style={{ width: "100%" }}
                options={Object.keys(data[0]).map((s) => ({
                    label: s,
                    value: s,
                }))}
            />
            <Table
                size="small"
                columns={available}
                dataSource={initial.finalData}
                bordered
                pagination={false}
                rowKey="key"
                scroll={{ y: 55 * 10 }}
                sticky
            />
        </Stack>
    );
}
