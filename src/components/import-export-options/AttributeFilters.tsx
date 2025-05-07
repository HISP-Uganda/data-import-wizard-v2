import { Spacer, Stack } from "@chakra-ui/react";
import type { TableProps } from "antd";
import { Space, Table, Input, Button, Select } from "antd";
import { Filter } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useState } from "react";
import { mappingApi } from "../../Events";
import { $mapping, $program } from "../../Store";
export default function AttributeFilters() {
    const mapping = useStore($mapping);
    const [active, setActive] = useState<number>(-1);
    const program = useStore($program);
    const columns: TableProps<Filter>["columns"] = [
        {
            title: "Attribute",
            render: (_, record, index) => {
                if (index === active)
                    return (
                        <Select
                            style={{ width: "100%" }}
                            options={program.programTrackedEntityAttributes?.map(
                                ({ trackedEntityAttribute: { id, name } }) => ({
                                    label: name,
                                    value: id,
                                }),
                            )}
                            onChange={(value) => {
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "attributeFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.attributeFilters ?? []
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
                else return record.attribute;
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
                            onChange={(value) => {
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "attributeFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.attributeFilters ?? []
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
                const attribute = program.programTrackedEntityAttributes?.find(
                    ({ trackedEntityAttribute }) =>
                        trackedEntityAttribute.id === record.attribute,
                );

                if (
                    index === active &&
                    attribute &&
                    attribute.trackedEntityAttribute.optionSetValue
                )
                    return (
                        <Select
                            style={{ width: "100%" }}
                            options={attribute.trackedEntityAttribute.optionSet?.options.map(
                                ({ name, code }) => ({
                                    label: name,
                                    value: code,
                                }),
                            )}
                            onChange={(value) => {
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "attributeFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.attributeFilters ?? []
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
                    attribute &&
                    !attribute.trackedEntityAttribute.optionSetValue
                )
                    return (
                        <Input
                            onChange={(e) =>
                                mappingApi.update({
                                    attribute: "dhis2SourceOptions",
                                    path: "attributeFilters",
                                    value: [
                                        ...(
                                            mapping.dhis2SourceOptions
                                                ?.attributeFilters ?? []
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
                    <Button onClick={() => setActive(() => index)}>Edit</Button>
                    <Button onClick={() => setActive(() => -1)}>OK</Button>
                </Space>
            ),
        },
    ];

    const addFilter = () => {
        mappingApi.update({
            attribute: "dhis2SourceOptions",
            path: "attributeFilters",
            value: [
                ...(mapping.dhis2SourceOptions?.attributeFilters ?? []),
                {},
            ],
        });
        setActive(mapping.dhis2SourceOptions?.attributeFilters?.length ?? 0);
    };

    const deleteFilter = (index: number) => {
        mappingApi.update({
            attribute: "dhis2SourceOptions",
            path: "attributeFilters",
            value: [
                ...(mapping.dhis2SourceOptions?.attributeFilters ?? []).flatMap(
                    (a, index) => {
                        if (index === active) {
                            return [];
                        }
                        return a;
                    },
                ),
            ],
        });
        setActive(() => -1);
    };
    return (
        <Table
            columns={columns}
            dataSource={mapping.dhis2SourceOptions?.attributeFilters}
            footer={() => (
                <Stack direction="row" alignItems="center">
                    <Spacer />
                    <Button onClick={addFilter}>Add Filter</Button>
                </Stack>
            )}
        />
    );
}
