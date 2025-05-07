import type { TabsProps } from "antd";
import { Table, TableColumnsType, Tabs } from "antd";
import { useStore } from "effector-react";
import { useState } from "react";

import { ExportColumn, Option } from "data-import-wizard-utils";
import { mappingApi } from "../../Events";
import { $mapping, $program } from "../../Store";

export default function Columns({ levels }: { levels: Option[] }) {
    const program = useStore($program);
    const mapping = useStore($mapping);
    const [active, setActive] = useState<string>("miscellaneous");

    const allAttributes =
        program.programTrackedEntityAttributes?.map(
            ({ trackedEntityAttribute: { id } }) => id,
        ) ?? [];

    const data = [
        {
            id: `trackedEntityInstance`,
            name: `Tracked Entity Instance Id`,
        },
        {
            id: `0-enrollment`,
            name: `Enrollment Id`,
        },
        {
            id: `0-enrollmentDate`,
            name: `Enrollment Date`,
        },
    ].concat(
        levels?.flatMap(({ value, label }) => [
            {
                id: `level${value}id`,
                name: `${label} id`,
            },
            {
                id: `level${value}name`,
                name: `${label} name`,
            },
        ]) ?? [],
    );

    const attributesMap: Map<string, string> = new Map(
        program.programTrackedEntityAttributes
            ?.map(({ trackedEntityAttribute: { id, name } }) => ({ id, name }))
            .concat(data.map(({ id, name }) => ({ id, name })))
            .map(({ id, name }) => [id, name]),
    );

    const columns: TableColumnsType<{ id: string; name: string }> = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text: string) => <a>{text}</a>,
        },
    ];

    const onChange = (key: string) => {
        setActive(() => key);
    };
    const items: TabsProps["items"] = program.programStages?.map((stage) => ({
        key: stage.id,
        label: stage.name,
        children: (
            <Table<{ id: string; name: string }>
                rowSelection={{
                    type: "checkbox",
                    onSelect: (record) => {
                        let value = mapping.dhis2SourceOptions?.columns ?? [];
                        const hasStage =
                            value.find((c) => c.column === stage.id) !==
                            undefined;
                        const currentColumn: ExportColumn = {
                            column: stage.id,
                            label: stage.name,
                            repeatable: stage.repeatable,
                            children: [
                                { column: record.id, label: record.name },
                            ],
                        };
                        if (hasStage) {
                            value = value.map<ExportColumn>((column) => {
                                if (column.column === stage.id) {
                                    let children = column.children;
                                    const search = children.find(
                                        (c) => c.column === record.id,
                                    );

                                    if (search) {
                                        children = children.filter(
                                            (c) => c.column !== record.id,
                                        );
                                    } else {
                                        children = children.concat({
                                            column: record.id,
                                            label: record.name,
                                        });
                                    }

                                    return {
                                        column: stage.id,
                                        label: stage.name,
                                        repeatable: stage.repeatable,
                                        children,
                                    };
                                }
                                return column;
                            });
                        } else {
                            value = value.concat(currentColumn);
                        }
                        mappingApi.update({
                            attribute: "dhis2SourceOptions",
                            path: "columns",
                            value,
                        });
                    },
                    onSelectAll: (selected) => {
                        const value = mapping.dhis2SourceOptions?.columns ?? [];
                        const children = stage.programStageDataElements
                            .map(({ dataElement: { id: column, name } }) => ({
                                column,
                                label: name,
                            }))
                            .concat([
                                { column: `eventDate`, label: "Event Date" },
                            ]);
                        if (selected) {
                            mappingApi.update({
                                attribute: "dhis2SourceOptions",
                                path: "columns",
                                value: value.concat({
                                    column: stage.id,
                                    repeatable: stage.repeatable,
                                    children,
                                    label: stage.name,
                                }),
                            });
                        } else {
                            mappingApi.update({
                                attribute: "dhis2SourceOptions",
                                path: "columns",
                                value: value.filter(
                                    (c) => c.column !== stage.id,
                                ),
                            });
                        }
                    },
                    selectedRowKeys: mapping.dhis2SourceOptions?.columns
                        ?.find((c) => c.column === stage.id)
                        ?.children?.map(({ column }) => {
                            return column;
                        }),
                }}
                rowKey="id"
                columns={columns}
                dataSource={[{ id: `eventDate`, name: "Event Date" }].concat(
                    stage.programStageDataElements.map((a) => ({
                        id: `${a.dataElement.id}`,
                        name: a.dataElement.name,
                    })),
                )}
                pagination={false}
                scroll={{ y: 55 * 10 }}
            />
        ),
    }));

    return (
        <Tabs
            items={[
                {
                    key: "miscellaneous",
                    label: "Miscellaneous",
                    children: (
                        <Table<{ id: string; name: string }>
                            rowSelection={{
                                type: "checkbox",
                                onSelect: (record) => {
                                    let value =
                                        mapping.dhis2SourceOptions?.columns ??
                                        [];
                                    const hasColumn = value.find(
                                        (c) => c.column === record.id,
                                    );
                                    if (hasColumn) {
                                        value = value.filter(
                                            ({ column }) =>
                                                column !== record.id,
                                        );
                                    } else {
                                        value = value.concat({
                                            column: record.id,
                                            label: record.name,
                                            children: [],
                                        });
                                    }
                                    mappingApi.update({
                                        attribute: "dhis2SourceOptions",
                                        path: "columns",
                                        value,
                                    });
                                },
                                onSelectAll: (selected) => {
                                    const removeSet =
                                        data.map(({ id }) => id) ?? [];

                                    let value =
                                        mapping.dhis2SourceOptions?.columns ??
                                        [];

                                    if (selected) {
                                        value = value
                                            .filter(
                                                ({ column }) =>
                                                    removeSet.indexOf(
                                                        column,
                                                    ) === -1,
                                            )
                                            .concat(
                                                removeSet.map((id) => ({
                                                    column: id,
                                                    children: [],
                                                    label:
                                                        attributesMap.get(id) ??
                                                        "",
                                                })) ?? [],
                                            );
                                        mappingApi.update({
                                            attribute: "dhis2SourceOptions",
                                            path: "columns",
                                            value,
                                        });
                                    } else {
                                        value = value.filter(
                                            ({ column }) =>
                                                removeSet.indexOf(column) ===
                                                -1,
                                        );
                                        mappingApi.update({
                                            attribute: "dhis2SourceOptions",
                                            path: "columns",
                                            value,
                                        });
                                    }
                                },
                                selectedRowKeys:
                                    mapping.dhis2SourceOptions?.columns?.map(
                                        (c) => c.column,
                                    ) ?? [],
                            }}
                            rowKey="id"
                            columns={columns}
                            dataSource={data}
                            pagination={false}
                            scroll={{ y: 55 * 10 }}
                        />
                    ),
                },
                {
                    key: "attributes",
                    label: "Attributes",
                    children: (
                        <Table<{ id: string; name: string }>
                            rowSelection={{
                                type: "checkbox",
                                onSelect: (record) => {
                                    let value =
                                        mapping.dhis2SourceOptions?.columns ??
                                        [];
                                    const hasColumn =
                                        value.find(
                                            (c) => c.column === record.id,
                                        ) !== undefined;
                                    if (hasColumn) {
                                        value = value.filter(
                                            ({ column }) =>
                                                column !== record.id,
                                        );
                                    } else {
                                        value = value.concat({
                                            column: record.id,
                                            label: record.name,
                                            children: [],
                                        });
                                    }

                                    mappingApi.update({
                                        attribute: "dhis2SourceOptions",
                                        path: "columns",
                                        value,
                                    });
                                },
                                onSelectAll: (selected) => {
                                    let value =
                                        mapping.dhis2SourceOptions?.columns ??
                                        [];
                                    if (selected) {
                                        value = value.filter(
                                            ({ column }) =>
                                                allAttributes.indexOf(
                                                    column,
                                                ) === -1,
                                        );
                                        mappingApi.update({
                                            attribute: "dhis2SourceOptions",
                                            path: "columns",
                                            value: value.concat(
                                                allAttributes.map((id) => {
                                                    return {
                                                        column: id,
                                                        children: [],
                                                        label:
                                                            attributesMap.get(
                                                                id,
                                                            ) ?? "",
                                                    };
                                                }),
                                            ),
                                        });
                                    } else {
                                        value = value.filter(
                                            ({ column }) =>
                                                allAttributes.indexOf(
                                                    column,
                                                ) === -1,
                                        );
                                        mappingApi.update({
                                            attribute: "dhis2SourceOptions",
                                            path: "columns",
                                            value,
                                        });
                                    }
                                },
                                selectedRowKeys:
                                    mapping.dhis2SourceOptions?.columns?.flatMap(
                                        (c) => {
                                            if (
                                                allAttributes.indexOf(
                                                    c.column,
                                                ) !== -1
                                            ) {
                                                return c.column;
                                            }
                                            return [];
                                        },
                                    ) ?? [],
                            }}
                            rowKey="id"
                            columns={columns}
                            dataSource={program.programTrackedEntityAttributes?.map(
                                (a) => ({
                                    id: a.trackedEntityAttribute.id,
                                    name: a.trackedEntityAttribute.name,
                                }),
                            )}
                            pagination={false}
                            scroll={{ y: 55 * 10 }}
                        />
                    ),
                },
                ...(items ?? []),
            ]}
            activeKey={active}
            onChange={onChange}
        />
    );
}
