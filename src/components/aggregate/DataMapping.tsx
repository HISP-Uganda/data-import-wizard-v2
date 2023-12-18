import {
    Checkbox,
    Icon,
    Input,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { FiCheck } from "react-icons/fi";

import Table, { ColumnsType } from "antd/es/table";
import { ChangeEvent, useEffect, useState } from "react";
import { $aggMetadata, $aggregateMapping } from "../../pages/aggregate";
import {
    $attributeMapping,
    $names,
    attributeMappingApi,
} from "../../pages/program";
import DestinationIcon from "../DestinationIcon";
import Search from "../Search";
import SourceIcon from "../SourceIcon";

const DataMapping = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const attributeMapping = useStore($attributeMapping);
    const aggregateMapping = useStore($aggregateMapping);
    const aggregateMetadata = useStore($aggMetadata);
    const { source, destination } = useStore($names);
    const [currentAttributes, setCurrentAttributes] = useState(
        aggregateMetadata.destinationColumns
    );
    const [searchString, setSearchString] = useState<string>("");
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

    const columns: ColumnsType<Partial<Option>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={aggregateMapping} />
                    <Text> Destination Attribute</Text>
                    <Text>{destination}</Text>
                </Stack>
            ),
            dataIndex: "label",
            key: "label",
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
                    <SourceIcon mapping={aggregateMapping} />
                    <Text>Source Attribute</Text>
                    <Text>{source}</Text>
                </Stack>
            ),
            key: "source",
            width: "40%",
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
                        value={aggregateMetadata.sourceColumns?.find(
                            (val) =>
                                val.value ===
                                attributeMapping[value ?? ""]?.value
                        )}
                        options={aggregateMetadata.sourceColumns}
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
            label: destinationLabel,
            mandatory,
        } of aggregateMetadata.destinationColumns) {
            if (attributeMapping[destinationValue ?? ""] === undefined) {
                const search = aggregateMetadata.sourceColumns.find(
                    ({ value }) => value === destinationValue
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
                } else {
                    const search2 = aggregateMetadata.sourceColumns.find(
                        ({ label }) => label === destinationLabel
                    );
                    if (search2) {
                        attributeMappingApi.updateMany({
                            attribute: `${destinationValue}`,
                            update: {
                                value: search2.value,
                                unique,
                                mandatory,
                            },
                        });
                    }
                }
            }
        }
    }, []);
    return (
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            <Search
                options={aggregateMetadata.destinationColumns}
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
                dataSource={currentAttributes}
                rowKey="value"
                pagination={{ pageSize: 8, hideOnSinglePage: true }}
                size="middle"
                footer={() => (
                    <Text textAlign="right">
                        Mapped {Object.keys(attributeMapping || {}).length} of{" "}
                        {aggregateMetadata.destinationColumns?.length || 0}
                    </Text>
                )}
            />
        </Stack>
    );
};

export default DataMapping;
