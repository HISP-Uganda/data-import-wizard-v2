import {
    Box,
    Checkbox,
    Icon,
    Input,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import {
    $attributeMapping,
    $metadata,
    $names,
    $programMapping,
    attributeMappingApi,
    programMappingApi,
} from "../../pages/program";
import { isMapped } from "../../pages/program/utils";
import DestinationIcon from "../DestinationIcon";
import OptionSetMapping from "../OptionSetMapping";
import Progress from "../Progress";
import SourceIcon from "../SourceIcon";

const Display = ({ data }: { data: Option[] }) => {
    const metadata = useStore($metadata);
    const attributeMapping = useStore($attributeMapping);
    const { source, destination } = useStore($names);
    const programMapping = useStore($programMapping);

    const columns: ColumnsType<Partial<Option>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={programMapping} />
                    <Text> Destination Attribute</Text>
                    <Text>{destination}</Text>
                </Stack>
            ),
            render: (_, { value, label }) => label,
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
            render: (_, { value, valueType, unique }) => {
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
            render: (_, { value, optionSetValue, availableOptions }) => {
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
            render: (_, { value }) => {
                if (isMapped(value, attributeMapping, metadata.sourceColumns)) {
                    return (
                        <Icon as={FiCheck} color="green.400" fontSize="2xl" />
                    );
                }
                return null;
            },
            key: "mapped",
        },
    ];

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
        <Stack>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="value"
                pagination={{ pageSize: 8, hideOnSinglePage: true }}
                size="middle"
                footer={() => (
                    <Text textAlign="right">
                        Mapped{" "}
                        {
                            Object.values(attributeMapping).filter(
                                ({ value }) => !!value
                            ).length
                        }{" "}
                        of {data.length}
                    </Text>
                )}
            />
        </Stack>
    );
};

export function OtherSystemMapping() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const metadata = useStore($metadata);
    const programMapping = useStore($programMapping);
    const attributeMapping = useStore($attributeMapping);
    const entityOptions: Option[] = [
        { label: "Case", value: "CASE" },
        { label: "Contact", value: "CONTACT" },
        { label: "Event", value: "EVENT" },
    ];

    useEffect(() => {
        if (
            programMapping.dataSource === "go-data" &&
            !programMapping.program?.responseKey
        ) {
            programMappingApi.update({
                attribute: "program",
                key: "responseKey",
                value: "CASE",
            });
        }
    }, []);

    useEffect(() => {
        let actualAttributes = metadata.destinationAttributes;

        if (programMapping.dataSource === "go-data") {
            if (programMapping.program?.responseKey === "EVENT") {
                actualAttributes = metadata.events;
            } else if (programMapping.program?.responseKey === "CASE") {
                actualAttributes = [...metadata.case, ...metadata.epidemiology];
            } else if (programMapping.program?.responseKey === "CONTACT") {
                actualAttributes = [
                    ...metadata.contact,
                    ...metadata.epidemiology,
                ];
            }
        }
        for (const {
            value: destinationValue,
            unique,
            label: destinationLabel,
            mandatory,
        } of actualAttributes) {
            if (attributeMapping[destinationValue ?? ""] === undefined) {
                const search = metadata.sourceColumns.find(
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
                    const search2 = metadata.sourceColumns.find(
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
    }, [programMapping.program?.responseKey]);

    if (programMapping.dataSource === "go-data") {
        return (
            <Stack>
                <Stack direction="row" alignItems="center">
                    <Text>Entity</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={entityOptions.find(
                                (val) =>
                                    val.value ===
                                    programMapping.program?.responseKey
                            )}
                            options={entityOptions}
                            isClearable
                            placeholder="Select"
                            onChange={(e) =>
                                programMappingApi.update({
                                    attribute: "program",
                                    key: "responseKey",
                                    value: e?.value,
                                })
                            }
                        />
                    </Box>
                </Stack>

                {programMapping.program?.responseKey === "EVENT" ? (
                    <Display data={metadata.events} />
                ) : (
                    <Tabs>
                        <TabList>
                            <Tab>Personal</Tab>
                            <Tab>Epidemiology</Tab>
                            <Tab>Questionnaire</Tab>
                            {programMapping.program?.responseKey ===
                                "CONTACT" && <Tab>Relationship</Tab>}
                            <Tab>Lab</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <Display
                                    data={
                                        programMapping.program?.responseKey ===
                                        "CONTACT"
                                            ? metadata.contact
                                            : metadata.case
                                    }
                                />
                            </TabPanel>
                            <TabPanel>
                                <Display data={metadata.epidemiology} />
                            </TabPanel>
                            <TabPanel>
                                <Display data={metadata.questionnaire} />
                            </TabPanel>
                            {programMapping.program?.responseKey ===
                                "CONTACT" && (
                                <TabPanel>
                                    <Display data={metadata.relationship} />
                                </TabPanel>
                            )}
                            <TabPanel>
                                <Display data={metadata.lab} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </Stack>
        );
    }

    return (
        <Stack>
            <Display data={metadata.destinationColumns} />
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Creating initial mapping and trying to map automatically"
                onOpen={onOpen}
            />
        </Stack>
    );
}
