import { SearchIcon } from "@chakra-ui/icons";
import {
    Box,
    Checkbox,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    Spacer,
    Stack,
    Text,
} from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { GroupBase, Select } from "chakra-react-select";
import {
    IProgramStageDataElement,
    Mapping,
    Option,
    RealMapping,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { $mapping, $metadata, $names, $programStageMapping } from "../Store";

import { stageMappingApi } from "../Events";
import CustomColumn from "./CustomColumn";
import DestinationIcon from "./DestinationIcon";
import OptionSetMapping from "./OptionSetMapping";
import ColumnMapping from "./program/ColumnMapping";
import FeatureColumn from "./program/FeatureColumn";
import SourceIcon from "./SourceIcon";

export default function ProgramStageMapping({
    psId,
    programStageDataElements,
    featureType,
}: {
    psId: string;
    programStageDataElements: IProgramStageDataElement[];
    repeatable: boolean;
    featureType: string;
}) {
    const mapping = useStore($mapping);
    const programStageMapping = useStore($programStageMapping);
    const metadata = useStore($metadata);
    const { source, destination } = useStore($names);
    const updateStage = (
        attributes: { attribute: string; value: any; key: keyof RealMapping }[],
        stage: string
    ) => {
        for (const { attribute, value, key } of attributes) {
            stageMappingApi.update({
                key,
                attribute,
                stage,
                value,
            });
        }
    };

    const stageMapping: Mapping = programStageMapping[psId] ?? { info: {} };

    const { info, ...rest } = stageMapping;
    const {
        createEvents = false,
        updateEvents = false,
        uniqueEventDate = false,
        createEmptyEvents = false,
        customEventIdColumn = false,
        customEventDateColumn = false,
        customDueDateColumn = false,
        completeEvents = false,
        eventDateColumn = "",
        eventIdColumn = "",
        stage,
    } = info;

    const [searchString, setSearchString] = useState<string>("");
    const [currentElements, setCurrentElements] = useState(
        programStageDataElements
    );

    const columns: ColumnsType<Partial<IProgramStageDataElement>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={mapping} />
                    <Text> Destination Data Element</Text>
                    <Text>{destination}</Text>
                </Stack>
            ),
            render: (_, { dataElement }) => {
                return dataElement?.name;
            },
            key: "dataElement.name",
        },
        {
            title: "Compulsory",
            key: "manual",
            width: "100px",
            align: "center",
            render: (_, { dataElement }) => {
                if (dataElement) {
                    const { id } = dataElement;

                    const isMandatory =
                        programStageMapping[psId]?.[id]?.mandatory || false;

                    return (
                        <Checkbox
                            isChecked={isMandatory}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: id,
                                    key: "mandatory",
                                    stage: psId,
                                    value: e.target.checked,
                                })
                            }
                        />
                    );
                }
                return null;
            },
        },
        {
            title: "Custom",
            align: "center",
            key: "custom",
            render: (_, { dataElement }) => {
                if (dataElement) {
                    const { id } = dataElement;
                    const isCustom =
                        programStageMapping[psId]?.[id]?.isCustom || false;
                    return (
                        <Checkbox
                            isChecked={isCustom}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: id,
                                    key: "isCustom",
                                    stage: psId,
                                    value: e.target.checked,
                                })
                            }
                        />
                    );
                }
                return null;
            },
        },

        {
            title: "Specific",
            align: "center",
            key: "specific",
            render: (_, { dataElement }) => {
                if (dataElement) {
                    const { id } = dataElement;
                    const isSpecific =
                        programStageMapping[psId]?.[id]?.isSpecific || false;
                    return (
                        <Checkbox
                            isChecked={isSpecific}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: id,
                                    key: "isSpecific",
                                    stage: psId,
                                    value: e.target.checked,
                                })
                            }
                        />
                    );
                }
                return null;
            },
        },

        {
            title: (
                <Stack direction="row" alignItems="center">
                    <SourceIcon mapping={mapping} />
                    <Text> Source Data Element</Text>
                    <Text>{source}</Text>
                </Stack>
            ),
            key: "source",
            render: (_, { dataElement, compulsory }) => {
                if (dataElement) {
                    const { id } = dataElement;

                    if (programStageMapping[psId]?.[id]?.isCustom) {
                        return (
                            <CustomColumn
                                mapping={stageMapping}
                                value={id}
                                onTypeUpdate={(e) =>
                                    updateStage(
                                        [
                                            {
                                                attribute: `${id}`,
                                                key: "customType",
                                                value: e?.value ?? "",
                                            },
                                        ],
                                        psId
                                    )
                                }
                                onValueChange={(val) => {
                                    updateStage(
                                        [
                                            {
                                                attribute: `${id}`,
                                                key: "value",
                                                value: val,
                                            },
                                        ],
                                        psId
                                    );
                                }}
                            />
                        );
                    }
                    if (programStageMapping[psId]?.[id]?.isSpecific) {
                        return (
                            <Input
                                value={stageMapping?.[id]?.value}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    updateStage(
                                        [
                                            {
                                                attribute: `${id}`,
                                                key: "value",
                                                value: e.target.value,
                                            },
                                        ],
                                        psId
                                    )
                                }
                            />
                        );
                    }
                    return (
                        <Select<Option, false, GroupBase<Option>>
                            value={metadata.sourceColumns.find(
                                (val) => val.value === stageMapping?.[id]?.value
                            )}
                            options={metadata.sourceColumns.filter(
                                ({ value }) => {
                                    if (stage) {
                                        return value?.indexOf(stage) !== -1;
                                    }
                                    return true;
                                }
                            )}
                            isClearable
                            onChange={(e) =>
                                updateStage(
                                    [
                                        {
                                            attribute: `info`,
                                            key: "mandatory",
                                            value: compulsory,
                                        },
                                        {
                                            attribute: `${id}`,
                                            key: "value",
                                            value: e?.value || "",
                                        },
                                    ],
                                    psId
                                )
                            }
                        />
                    );
                }
                return null;
            },
        },

        {
            title: "Unique",
            align: "center",
            key: "unique",
            render: (_, { dataElement }) => {
                if (dataElement) {
                    const { id } = dataElement;

                    const isUnique =
                        programStageMapping[psId]?.[id]?.unique || false;

                    return (
                        <Checkbox
                            isChecked={isUnique}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: id,
                                    key: "unique",
                                    stage: psId,
                                    value: e.target.checked,
                                })
                            }
                        />
                    );
                }
            },
        },
        {
            title: "Options",
            key: "options",
            align: "center",
            width: "100px",
            render: (text, { dataElement }) => {
                if (dataElement) {
                    const { id, optionSetValue, optionSet } = dataElement;
                    const value = programStageMapping[psId]?.[id]?.value || "";
                    if (optionSetValue) {
                        return (
                            <OptionSetMapping
                                value={value}
                                destinationOptions={optionSet?.options.map(
                                    ({ code, name }) => ({
                                        label: name,
                                        value: code,
                                    })
                                )}
                                mapping={programStageMapping[psId]}
                            />
                        );
                    }
                }
                return null;
            },
        },

        {
            title: "Mapped",
            align: "center",
            width: "100px",
            render: (text, { dataElement }) => {
                if (dataElement) {
                    const { id } = dataElement;
                    if (rest[id]?.value) {
                        return (
                            <Icon
                                as={FiCheck}
                                color="green.400"
                                fontSize="2xl"
                            />
                        );
                    }
                }
                return null;
            },
            key: "mapped",
        },
    ];

    const filterUnits = (checked: boolean) => {
        const mapped = Object.keys(rest);
        if (checked) {
            setCurrentElements(() =>
                programStageDataElements.filter(
                    ({ dataElement: { id } }) => mapped.indexOf(id) !== -1
                )
            );
        } else {
            setCurrentElements(programStageDataElements);
        }
    };

    const searchOus = (search: string) => {
        setSearchString(() => search);
        setCurrentElements(() =>
            programStageDataElements.filter(({ dataElement: { id, name } }) =>
                name.toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    const updateStageAttributes = () => {
        for (const element of programStageDataElements) {
            if (rest[`${element.dataElement.id}`] === undefined) {
                const search = metadata.sourceColumns.find(
                    ({ value }) =>
                        value && value.includes(element.dataElement.id)
                );
                if (search) {
                    stageMappingApi.update({
                        stage: psId,
                        attribute: element.dataElement.id,
                        key: "value",
                        value: search.value,
                    });
                } else {
                    const search2 = metadata.sourceColumns.find(
                        ({ value }) =>
                            value && value.includes(element.dataElement.name)
                    );

                    if (search2) {
                        stageMappingApi.update({
                            stage: psId,
                            attribute: element.dataElement.id,
                            key: "value",
                            value: search2.value,
                        });
                    }
                }
            }
        }
    };

    const onCreateEvents = (e: ChangeEvent<HTMLInputElement>) => {
        stageMappingApi.update({
            stage: psId,
            attribute: "info",
            key: "createEvents",
            value: e.target.checked,
        });
        if (e.target.checked) {
            updateStageAttributes();
        }
    };

    const onUpdateEvents = (e: ChangeEvent<HTMLInputElement>) => {
        stageMappingApi.update({
            stage: psId,
            attribute: "info",
            key: "updateEvents",
            value: e.target.checked,
        });
        if (e.target.checked) {
            updateStageAttributes();
        }
    };

    return (
        <Stack key={psId} spacing="20px">
            <Stack spacing={[1, 5]} direction={["column", "row"]}>
                <Checkbox
                    colorScheme="green"
                    isChecked={createEvents}
                    onChange={onCreateEvents}
                >
                    Create Events
                </Checkbox>

                <Checkbox
                    colorScheme="green"
                    isChecked={updateEvents}
                    onChange={onUpdateEvents}
                >
                    Update Events
                </Checkbox>

                <Checkbox
                    colorScheme="green"
                    isChecked={completeEvents}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        stageMappingApi.update({
                            stage: psId,
                            attribute: "info",
                            key: "completeEvents",
                            value: e.target.checked,
                        })
                    }
                >
                    Complete Events
                </Checkbox>
                <Checkbox
                    colorScheme="green"
                    isChecked={uniqueEventDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        stageMappingApi.update({
                            stage: psId,
                            attribute: "info",
                            key: "uniqueEventDate",
                            value: e.target.checked,
                        })
                    }
                >
                    Mark Event Date As Unique
                </Checkbox>
                <Checkbox
                    colorScheme="green"
                    isChecked={createEmptyEvents}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        stageMappingApi.update({
                            stage: psId,
                            attribute: "info",
                            key: "createEmptyEvents",
                            value: e.target.checked,
                        })
                    }
                >
                    Create Empty Events
                </Checkbox>
            </Stack>
            <Stack direction="row" spacing="20px" alignItems="center">
                {mapping.dataSource === "dhis2-program" && (
                    <Stack flex={1} direction="row" alignItems="center">
                        <Text>Specific Stage</Text>
                        <Box flex={1}>
                            <Select<Option, false, GroupBase<Option>>
                                value={metadata.destinationStages.find(
                                    (val) => val.value === stage
                                )}
                                options={metadata.destinationStages}
                                isClearable
                                onChange={(e) => {
                                    stageMappingApi.update({
                                        stage: psId,
                                        attribute: "info",
                                        key: "stage",
                                        value: e?.value || "",
                                    });

                                    if (e) {
                                        updateStage(
                                            [
                                                {
                                                    attribute: "info",
                                                    key: "eventDateColumn",
                                                    value: `${e.value}.eventDate`,
                                                },
                                                {
                                                    attribute: "info",
                                                    key: "dueDateColumn",
                                                    value: `${e.value}.dueDate`,
                                                },
                                                {
                                                    attribute: "info",
                                                    key: "eventIdColumn",
                                                    value: `${e.value}.event`,
                                                },
                                            ],
                                            psId
                                        );
                                    }
                                }}
                            />
                        </Box>
                    </Stack>
                )}
                <ColumnMapping
                    title="Event Date Column"
                    customColumn="customEventDateColumn"
                    value={eventDateColumn}
                    isCustom={customEventDateColumn}
                    psId={psId}
                    valueColumn="eventDateColumn"
                />
                <ColumnMapping
                    title="Due Date Column"
                    customColumn="customDueDateColumn"
                    value={eventDateColumn}
                    isCustom={customDueDateColumn}
                    psId={psId}
                    valueColumn="dueDateColumn"
                />

                <ColumnMapping
                    title="Event Id Column"
                    customColumn="customEventIdColumn"
                    value={eventIdColumn}
                    isCustom={customEventIdColumn}
                    psId={psId}
                    valueColumn="eventIdColumn"
                />
            </Stack>
            <FeatureColumn featureType={featureType} psId={psId} />
            <Stack direction="row">
                <Checkbox
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        filterUnits(e.target.checked)
                    }
                >
                    <Text>Show Mapped Data Elements Only</Text>
                </Checkbox>
                <Spacer />
                <Box w="35%">
                    <InputGroup>
                        <InputLeftElement>
                            <SearchIcon color="gray.300" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search data elements"
                            value={searchString}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                searchOus(e.target.value)
                            }
                        />
                    </InputGroup>
                </Box>
            </Stack>

            <Table
                columns={columns}
                dataSource={currentElements}
                rowKey={({ dataElement }) => dataElement?.id ?? ""}
                pagination={{ pageSize: 5, hideOnSinglePage: true }}
                size="middle"
                footer={() => (
                    <Text textAlign="right">
                        Mapped{" "}
                        {
                            Object.values(rest).filter(({ value }) => !!value)
                                .length
                        }{" "}
                        of {currentElements.length}
                    </Text>
                )}
            />
        </Stack>
    );
}
