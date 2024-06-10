import {
    Box,
    Checkbox,
    Icon,
    Input,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
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
    $program,
    $mapping,
} from "../../Store";
import { attributeMappingApi, mappingApi } from "../../Events";
import { findMapped, isMapped } from "../../utils/utils";
import CustomColumn from "../CustomColumn";
import DestinationIcon from "../DestinationIcon";
import MultipleSelect from "../MultipleSelect";
import OptionSetMapping from "../OptionSetMapping";
import Search from "../Search";
import SourceIcon from "../SourceIcon";

export default function AttributeMapping() {
    const attributeMapping = useStore($attributeMapping);
    const programMapping = useStore($mapping);
    const program = useStore($program);
    const toast = useToast();
    const metadata = useStore($metadata);
    const { source, destination } = useStore($names);
    const [attributes, setCurrentAttributes] = useState(
        metadata.destinationAttributes
    );

    const [searchString, setSearchString] = useState<string>("");

    const currentMappingValues = Object.values(attributeMapping).map(
        ({ value }) => value
    );

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
                    isChecked={attributeMapping[value ?? ""]?.isCustom}
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
                    isChecked={attributeMapping[value ?? ""]?.isSpecific}
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
                if (attributeMapping[value ?? ""]?.isCustom) {
                    return (
                        <CustomColumn
                            mapping={attributeMapping}
                            onTypeUpdate={(e) =>
                                attributeMappingApi.update({
                                    attribute: `${value}`,
                                    key: "customType",
                                    value: e?.value,
                                })
                            }
                            onValueChange={(val) =>
                                attributeMappingApi.update({
                                    attribute: `${value}`,
                                    key: "value",
                                    value: val,
                                })
                            }
                            value={value ?? ""}
                        />
                    );
                }

                if (attributeMapping[value ?? ""]?.isSpecific) {
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
                        onChange={(e) => {
                            attributeMappingApi.updateMany({
                                attribute: value ?? "",
                                update: {
                                    value: e?.value || "",
                                    unique:
                                        attributeMapping[value ?? ""]?.unique ||
                                        unique,
                                    valueType,
                                },
                            });
                            if (
                                e &&
                                e.value &&
                                currentMappingValues.indexOf(e.value) !== -1
                            ) {
                                toast({
                                    title: "Variable reused",
                                    description: `Variable ${e.label} already used`,
                                    status: "warning",
                                    duration: 9000,
                                    isClosable: true,
                                });
                            }
                        }}
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
                            mapping={attributeMapping}
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
                if (isMapped(value, attributeMapping)) {
                    return (
                        <Icon as={FiCheck} color="green.400" fontSize="2xl" />
                    );
                }
                return null;
            },
            key: "mapped",
        },
    ];

    const determineFeatureType = () => {
        if (program.trackedEntityType?.featureType === "POINT") {
            return (
                <Stack>
                    <Checkbox
                        isChecked={programMapping.program?.geometryMerged}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "program",
                                path: "geometryMerged",
                                value: e.target.checked,
                            })
                        }
                    >
                        Latitudes and Longitudes combined
                    </Checkbox>

                    {programMapping.program?.geometryMerged ? (
                        <Stack
                            alignItems="center"
                            flex={1}
                            direction="row"
                            spacing="20px"
                        >
                            <Text>Latitudes and Longitudes Column</Text>
                            <Box flex={1}>
                                <Select<Option, false, GroupBase<Option>>
                                    value={metadata.sourceColumns.find(
                                        (val) =>
                                            val.value ===
                                            programMapping.program
                                                ?.geometryColumn
                                    )}
                                    options={metadata.sourceColumns}
                                    isClearable
                                    placeholder="Select tracked entity column"
                                    onChange={(e) =>
                                        mappingApi.update({
                                            attribute: "program",
                                            path: "geometryColumn",
                                            value: e?.value || "",
                                        })
                                    }
                                />
                            </Box>
                        </Stack>
                    ) : (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing="20px"
                            flex={1}
                        >
                            <Stack direction="row" alignItems="center" flex={1}>
                                <Text>Latitude Column</Text>
                                <Box flex={1}>
                                    <Select<Option, false, GroupBase<Option>>
                                        value={metadata.sourceColumns.find(
                                            (val) =>
                                                val.value ===
                                                programMapping.program
                                                    ?.latitudeColumn
                                        )}
                                        options={metadata.sourceColumns}
                                        isClearable
                                        placeholder="Select latitude column"
                                        onChange={(e) =>
                                            mappingApi.update({
                                                attribute: "program",
                                                path: "latitudeColumn",
                                                value: e?.value || "",
                                            })
                                        }
                                    />
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" flex={1}>
                                <Text>Longitude Column</Text>
                                <Box flex={1}>
                                    <Select<Option, false, GroupBase<Option>>
                                        value={metadata.sourceColumns.find(
                                            (val) =>
                                                val.value ===
                                                programMapping.program
                                                    ?.longitudeColumn
                                        )}
                                        options={metadata.sourceColumns}
                                        isClearable
                                        placeholder="Select longitude column"
                                        onChange={(e) =>
                                            mappingApi.update({
                                                attribute: "program",
                                                path: "longitudeColumn",
                                                value: e?.value || "",
                                            })
                                        }
                                    />
                                </Box>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            );
        }

        if (program.trackedEntityType?.featureType === "POLYGON") {
            return (
                <Stack
                    alignItems="center"
                    flex={1}
                    direction="row"
                    spacing="20px"
                >
                    <Text>Latitudes and Longitudes Column</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={metadata.sourceColumns.find(
                                (val) =>
                                    val.value ===
                                    programMapping.program?.geometryColumn
                            )}
                            options={metadata.sourceColumns}
                            isClearable
                            placeholder="Select tracked entity column"
                            onChange={(e) =>
                                mappingApi.update({
                                    attribute: "program",
                                    path: "geometryColumn",
                                    value: e?.value || "",
                                })
                            }
                        />
                    </Box>
                </Stack>
            );
        }
        return null;
    };

    const determineTrackedEntityOptions = () => {
        if (programMapping.dataSource === "go-data") {
            return null;
        }

        return (
            <Stack spacing="20px" direction="row" alignItems="center">
                <Text>Tracked Entity Column</Text>
                <Stack spacing="0">
                    <Checkbox
                        isChecked={
                            programMapping.program
                                ?.trackedEntityInstanceColumnIsManual
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "program",
                                path: "trackedEntityInstanceColumnIsManual",
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
                                    mappingApi.update({
                                        attribute: "program",
                                        path: "trackedEntityInstanceColumn",
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
                                    mappingApi.update({
                                        attribute: "program",
                                        path: "trackedEntityInstanceColumn",
                                        value: e?.value || "",
                                    })
                                }
                            />
                        )}
                    </Box>
                </Stack>
            </Stack>
        );
    };
    useEffect(() => {
        for (const {
            value: destinationValue,
            unique,
            label: destinationLabel,
            mandatory,
        } of metadata.destinationAttributes) {
            if (attributeMapping[destinationValue ?? ""] === undefined) {
                const search = metadata.sourceColumns.find(
                    ({ value }) =>
                        value &&
                        destinationValue &&
                        value.includes(destinationValue)
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
                    const search2 = metadata.sourceColumns.find(
                        ({ label }) =>
                            label &&
                            destinationLabel &&
                            label.includes(destinationLabel)
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

    const setCustom = (attribute: string, manual: boolean) => {
        const isSpecific = attributeMapping[attribute]?.isSpecific;
        attributeMappingApi.update({
            attribute,
            key: "isCustom",
            value: manual,
        });

        if (isSpecific) {
            attributeMappingApi.update({
                attribute,
                key: "isSpecific",
                value: !isSpecific,
            });
        }
    };

    const setSpecific = (attribute: string, isSpecific: boolean) => {
        attributeMappingApi.update({
            attribute,
            key: "isSpecific",
            value: isSpecific,
        });
        const isManual = attributeMapping[attribute]?.isCustom;

        if (isManual) {
            attributeMappingApi.update({
                attribute,
                key: "isCustom",
                value: !isManual,
            });
        }
    };

    return (
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
            spacing="25px"
        >
            {determineTrackedEntityOptions()}

            <MultipleSelect
                title={
                    <Stack>
                        <Text>Geometry Column </Text>
                        <Text fontSize="12px">
                            Latitudes and Longitudes separated? select two
                            columns beginning with latitude
                        </Text>
                    </Stack>
                }
                mapping={programMapping}
                value="program.geometryColumn"
                onValueChange={(val) =>
                    mappingApi.update({
                        attribute: "program",
                        path: "geometryColumn",
                        value: val,
                    })
                }
            />
            <Search
                options={metadata.destinationAttributes}
                source={metadata.sourceAttributes}
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
                        Mapped{" "}
                        {findMapped(attributeMapping, metadata.sourceColumns)}{" "}
                        of {metadata.destinationAttributes?.length || 0}
                    </Text>
                )}
            />
        </Stack>
    );
}
