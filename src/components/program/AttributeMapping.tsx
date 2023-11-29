import { Box, Checkbox, Icon, Input, Stack, Text } from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { FiCheck } from "react-icons/fi";

import { ChangeEvent, useEffect, useState } from "react";
import {
    $attributeMapping,
    $metadata,
    $names,
    $programMapping,
    attributeMappingApi,
    programMappingApi,
} from "../../pages/program";
import DestinationIcon from "../DestinationIcon";
import OptionSetMapping from "../OptionSetMapping";
import Search from "../Search";
import SourceIcon from "../SourceIcon";

export default function AttributeMapping() {
    const attributeMapping = useStore($attributeMapping);
    const programMapping = useStore($programMapping);
    const metadata = useStore($metadata);
    const { source, destination } = useStore($names);

    const [attributes, setCurrentAttributes] = useState(
        metadata.destinationAttributes
    );

    const [searchString, setSearchString] = useState<string>("");

    const columns: ColumnsType<Partial<Option>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={programMapping} />
                    <Text> Destination Attribute</Text>
                    <Text>{destination}</Text>
                </Stack>
            ),
            dataIndex: "label",
            key: "label",
        },
        {
            title: "Mandatory",
            key: "mandatory",
            width: "100px",
            align: "center",
            render: (text, { value, mandatory }) => (
                <Checkbox
                    isChecked={
                        attributeMapping[value ?? ""]?.mandatory || mandatory
                    }
                    isReadOnly={mandatory}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        attributeMappingApi.update({
                            attribute: value ?? "",
                            key: "mandatory",
                            value: e.target.checked,
                        })
                    }
                />
            ),
        },
        {
            title: "Unique",
            key: "unique",
            width: "100px",
            align: "center",
            render: (text, { value, unique }) => (
                <Checkbox
                    isChecked={attributeMapping[value ?? ""]?.unique || unique}
                    isReadOnly={unique}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        attributeMappingApi.update({
                            attribute: value ?? "",
                            key: "unique",
                            value: e.target.checked,
                        });
                    }}
                />
            ),
        },
        {
            title: "Custom",
            key: "manual",
            width: "100px",
            align: "center",
            render: (text, { value }) => (
                <Checkbox
                    isChecked={attributeMapping[value ?? ""]?.manual}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCustom(value ?? "", e.target.checked)
                    }
                />
            ),
        },
        {
            title: "Specific",
            key: "specific",
            width: "100px",
            align: "center",
            render: (text, { value }) => (
                <Checkbox
                    isChecked={attributeMapping[value ?? ""]?.specific}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSpecific(value ?? "", e.target.checked)
                    }
                />
            ),
        },
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <SourceIcon mapping={programMapping} />
                    <Text>Source Attribute</Text>
                    <Text>{source}</Text>
                </Stack>
            ),
            key: "source",
            render: (text, { value, valueType, unique }) => {
                if (
                    attributeMapping[value ?? ""]?.manual ||
                    attributeMapping[value ?? ""]?.specific
                ) {
                    return (
                        <Input
                            value={attributeMapping[value ?? ""]?.value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                attributeMappingApi.update({
                                    attribute: `${value}`,
                                    key: "value",
                                    value: e.target.value,
                                })
                            }
                        />
                    );
                }
                return (
                    <Select<Option, false, GroupBase<Option>>
                        value={metadata.sourceColumns?.find(
                            (val) =>
                                val.value ===
                                attributeMapping[value ?? ""]?.value
                        )}
                        options={metadata.sourceColumns}
                        isClearable
                        size="md"
                        onChange={(e) =>
                            attributeMappingApi.updateMany(
                                attributeMappingApi.updateMany({
                                    attribute: value ?? "",
                                    update: {
                                        value: e?.value || "",
                                        unique:
                                            attributeMapping[value ?? ""]
                                                ?.unique || unique,
                                        valueType,
                                    },
                                })
                            )
                        }
                    />
                );
            },
        },
        {
            title: "Options",
            key: "value",
            width: "200px",
            render: (text, { value, optionSetValue, availableOptions }) => {
                if (optionSetValue) {
                    return (
                        <OptionSetMapping
                            value={value ?? ""}
                            destinationOptions={availableOptions || []}
                        />
                    );
                }
                return null;
            },
        },
        {
            title: "Mapped",
            width: "100px",
            render: (text, { value }) => {
                if (attributeMapping[value ?? ""]?.value) {
                    return (
                        <Icon as={FiCheck} color="green.400" fontSize="2xl" />
                    );
                }
                return null;
            },
            key: "mapped",
        },
    ];

    useEffect(() => {
        for (const {
            value: destinationValue,
            unique,
            label,
            mandatory,
        } of metadata.destinationAttributes) {
            if (attributeMapping[destinationValue ?? ""] === undefined) {
                const search = metadata.sourceAttributes.find(
                    ({ value }) => value === label
                );
                if (search) {
                    attributeMappingApi.updateMany({
                        attribute: `${destinationValue}`,
                        update: {
                            value: search.value,
                            unique,
                            mandatory,
                        },
                    });
                }
            }
        }
    }, []);

    const setCustom = (attribute: string, manual: boolean) => {
        const isSpecific = attributeMapping[attribute]?.specific;
        attributeMappingApi.update({
            attribute,
            key: "manual",
            value: manual,
        });

        if (isSpecific) {
            attributeMappingApi.update({
                attribute,
                key: "specific",
                value: !isSpecific,
            });
        }
    };

    const setSpecific = (attribute: string, specific: boolean) => {
        attributeMappingApi.update({
            attribute,
            key: "specific",
            value: specific,
        });
        const isManual = attributeMapping[attribute]?.manual;

        if (isManual) {
            attributeMappingApi.update({
                attribute,
                key: "manual",
                value: !isManual,
            });
        }
    };

    return (
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            <Stack spacing="20px" direction="row" alignItems="center">
                <Text>Tracked Entity Column</Text>
                <Stack spacing="0">
                    <Checkbox
                        isChecked={
                            programMapping.program
                                ?.trackedEntityInstanceColumnIsManual
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            programMappingApi.update({
                                attribute: "program",
                                key: "trackedEntityInstanceColumnIsManual",
                                value: e.target.checked,
                            })
                        }
                    >
                        Custom Tracked Entity Column
                    </Checkbox>
                    <Box w="500px">
                        {programMapping.program
                            ?.trackedEntityInstanceColumnIsManual ? (
                            <Input
                                value={
                                    programMapping.program
                                        ?.trackedEntityInstanceColumn
                                }
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    programMappingApi.update({
                                        attribute: "program",
                                        key: "trackedEntityInstanceColumn",
                                        value: e.target.value,
                                    })
                                }
                            />
                        ) : (
                            <Select<Option, false, GroupBase<Option>>
                                value={metadata.sourceColumns.find(
                                    (val) =>
                                        val.value ===
                                        programMapping.program
                                            ?.trackedEntityInstanceColumn
                                )}
                                options={metadata.sourceColumns}
                                isClearable
                                placeholder="Select tracked entity column"
                                onChange={(e) =>
                                    programMappingApi.update({
                                        attribute: "program",
                                        key: "trackedEntityInstanceColumn",
                                        value: e?.value || "",
                                    })
                                }
                            />
                        )}
                    </Box>
                </Stack>
            </Stack>

            <Search
                options={metadata.destinationAttributes}
                mapping={attributeMapping}
                searchString={searchString}
                setSearchString={setSearchString}
                action={setCurrentAttributes}
                placeholder="Search attributes"
                label="Show Mapped Attributes Only"
                label2="Show Unmapped Attributes Only"
            />

            <Table
                columns={columns}
                dataSource={attributes}
                rowKey="value"
                pagination={{ pageSize: 8, hideOnSinglePage: true }}
                size="middle"
                footer={() => (
                    <Text textAlign="right">
                        Mapped {Object.keys(attributeMapping || {}).length} of{" "}
                        {metadata.destinationAttributes?.length || 0}
                    </Text>
                )}
            />
        </Stack>
    );
}
