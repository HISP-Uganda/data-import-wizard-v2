import { Spacer, Stack } from "@chakra-ui/react";
import type { TableProps } from "antd";
import { Button, Input, Select, Space, Table } from "antd";
import { Filter } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useState } from "react";
import { mappingApi } from "../../Events";
import { $mapping, $program } from "../../Store";
export default function DataElementFilters() {
    const mapping = useStore($mapping);
    const [active, setActive] = useState<number>(-1);
    const program = useStore($program);
    const columns: TableProps<Filter>["columns"] = [
        {
            title: "Data Element",
            render: (_, record, index) => {
                if (index === active)
                    return (
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            filterOption={(input, option) => {
                                if (option && "options" in option) {
                                    const search = option.options.some(
                                        (a) =>
                                            a.label
                                                .toLowerCase()
                                                .includes(
                                                    input.toLowerCase(),
                                                ) ||
                                            a.value
                                                .toLowerCase()
                                                .includes(input.toLowerCase()),
                                    );

                                    return search;
                                }
                                return false;
                            }}
                            options={program.programStages?.map(
                                ({
                                    name,
                                    programStageDataElements,
                                    id: stageId,
                                }) => ({
                                    label: name,
                                    options: programStageDataElements.map(
                                        ({ dataElement: { id, name } }) => ({
                                            label: name,
                                            value: `${stageId}.${id}`,
                                        }),
                                    ),
                                }),
                            )}
                            value={record.attribute}
                            onChange={(value) => {
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "dataElementFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.dataElementFilters ?? []
                                        ).map((a, index) => {
                                            if (index === active) {
                                                return {
                                                    ...a,
                                                    attribute: value,
                                                };
                                            }
                                            return a;
                                        }),
                                    ],
                                });
                            }}
                        />
                    );
                else {
                    const dataElement = program.programStages
                        ?.flatMap((stage) => stage.programStageDataElements)
                        .find(
                            ({ dataElement }) =>
                                dataElement.id === record.attribute,
                        );
                    return dataElement?.dataElement.name ?? record.attribute;
                }
            },
            key: "attribute",
        },
        {
            title: "Operator",
            render: (_, record, index) => {
                if (index === active)
                    return (
                        <Select
                            style={{ width: "100%" }}
                            options={[
                                { label: "Equal", value: "eq" },
                                { label: "In", value: "in" },
                            ]}
                            value={record.operator}
                            onChange={(value) => {
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "dataElementFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.dataElementFilters ?? []
                                        ).map((a, index) => {
                                            if (index === active) {
                                                return {
                                                    ...a,
                                                    operator: value,
                                                };
                                            }
                                            return a;
                                        }),
                                    ],
                                });
                            }}
                        />
                    );
                else return record.operator;
            },
            key: "operator",
        },
        {
            title: "Value",
            render: (_, record, index) => {
                const dataElement = program.programStages
                    ?.flatMap((stage) => stage.programStageDataElements)
                    ?.find(
                        ({ dataElement }) =>
                            dataElement.id === record.attribute,
                    );
                if (
                    index === active &&
                    dataElement &&
                    dataElement.dataElement.optionSetValue
                )
                    return (
                        <Select
                            style={{ width: "100%" }}
                            options={dataElement.dataElement.optionSet?.options.map(
                                ({ name, code }) => ({
                                    label: name,
                                    value: code,
                                }),
                            )}
                            value={record.value}
                            onChange={(value) => {
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "dataElementFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.dataElementFilters ?? []
                                        ).map((a, index) => {
                                            if (index === active) {
                                                return {
                                                    ...a,
                                                    value,
                                                };
                                            }
                                            return a;
                                        }),
                                    ],
                                });
                            }}
                        />
                    );

                if (
                    index === active &&
                    dataElement &&
                    !dataElement.dataElement.optionSetValue
                )
                    return (
                        <Input
                            value={record.value}
                            onChange={(e) =>
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "dataElementFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.dataElementFilters ?? []
                                        ).map((a, index) => {
                                            if (index === active) {
                                                return {
                                                    ...a,
                                                    value: e.target.value,
                                                };
                                            }
                                            return a;
                                        }),
                                    ],
                                })
                            }
                        />
                    );
                else return record.value;
            },
            key: "value",
        },

        {
            title: "Action",
            key: "action",
            render: (_, record, index) => (
                <Space size="middle">
                    <Button danger onClick={() => deleteFilter(index)}>
                        Delete
                    </Button>
                    <Button
                        onClick={() => setActive(() => index)}
                        disabled={index === active}
                    >
                        Edit{index}
                    </Button>
                    <Button
                        onClick={() => setActive(() => -1)}
                        disabled={index !== active}
                    >
                        OK
                    </Button>
                </Space>
            ),
        },
    ];

    const addFilter = () => {
        mappingApi.update({
            attribute: "dhis2SourceOptions",
            path: "dataElementFilters",
            value: [
                ...(mapping.dhis2SourceOptions?.dataElementFilters ?? []),
                {},
            ],
        });
        setActive(mapping.dhis2SourceOptions?.dataElementFilters?.length ?? 0);
    };

    const deleteFilter = (index: number) => {
        mappingApi.update({
            attribute: "dhis2SourceOptions",
            path: "dataElementFilters",
            value: [
                ...(
                    mapping.dhis2SourceOptions?.dataElementFilters ?? []
                ).flatMap((a, index) => {
                    if (index === active) {
                        return [];
                    }
                    return a;
                }),
            ],
        });
        setActive(() => -1);
    };
    return (
        <Table
            columns={columns}
            dataSource={mapping.dhis2SourceOptions?.dataElementFilters}
            footer={() => (
                <Stack direction="row" alignItems="center">
                    <Spacer />
                    <Button onClick={addFilter}>Add Filter</Button>
                </Stack>
            )}
        />
    );
}
