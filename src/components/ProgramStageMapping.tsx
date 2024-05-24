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
import SourceIcon from "./SourceIcon";

export default function ProgramStageMapping({
    psId,
    programStageDataElements,
    repeatable,
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

    const { info, ...rest } = programStageMapping[psId] || {};
    const createEvents =
        programStageMapping[psId]?.["info"]?.createEvents || false;
    const updateEvents =
        programStageMapping[psId]?.["info"]?.updateEvents || false;
    const uniqueEventDate =
        programStageMapping[psId]?.["info"]?.uniqueEventDate || false;

    const customEventIdColumn =
        programStageMapping[psId]?.["info"]?.customEventIdColumn || false;
    const customEventDateColumn =
        programStageMapping[psId]?.["info"]?.customEventDateColumn || false;
    const customDueDateColumn =
        programStageMapping[psId]?.["info"]?.customDueDateColumn || false;

    const completeEvents =
        programStageMapping[psId]?.["info"]?.completeEvents || false;

    const geometryMerged =
        programStageMapping[psId]?.["info"]?.geometryMerged || false;

    const eventDateColumn =
        programStageMapping[psId]?.["info"]?.eventDateColumn || "";
    const dueDateColumn =
        programStageMapping[psId]?.["info"]?.dueDateColumn || "";
    const stage = programStageMapping[psId]?.["info"]?.stage || "";
    const stageMapping = programStageMapping[psId];

    const eventIdColumn =
        programStageMapping[psId]?.["info"]?.eventIdColumn || "";
    const geometryColumn =
        programStageMapping[psId]?.["info"]?.geometryColumn || "";
    const latitudeColumn =
        programStageMapping[psId]?.["info"]?.latitudeColumn || "";
    const longitudeColumn =
        programStageMapping[psId]?.["info"]?.longitudeColumn || "";

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
            render: (text, { dataElement }) => {
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
                    const { id, name, optionSetValue, optionSet } = dataElement;

                    const isUnique =
                        programStageMapping[psId]?.[id]?.unique || false;

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

    const determineTrackedEntityOptions = () => {
        return (
            <Stack spacing="20px" direction="row" alignItems="center" flex={1}>
                <Text>Event Id Column</Text>
                <Stack spacing="0" flex={1}>
                    <Checkbox
                        isChecked={customEventIdColumn}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            stageMappingApi.update({
                                attribute: "info",
                                stage: psId,
                                key: "customEventIdColumn",
                                value: e.target.checked,
                            })
                        }
                    >
                        Custom Event Id Column
                    </Checkbox>
                    <Box>
                        {customEventIdColumn ? (
                            <Input
                                value={eventIdColumn}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    stageMappingApi.update({
                                        stage: psId,
                                        attribute: "info",
                                        key: "eventIdColumn",
                                        value: e.target.value,
                                    })
                                }
                            />
                        ) : (
                            <Select<Option, false, GroupBase<Option>>
                                value={metadata.sourceColumns.find(
                                    (val) => val.value === eventIdColumn
                                )}
                                options={metadata.sourceColumns}
                                placeholder="Select event id column"
                                isClearable
                                onChange={(e) =>
                                    stageMappingApi.update({
                                        stage: psId,
                                        attribute: "info",
                                        key: "eventIdColumn",
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

    const determineFeatureType = () => {
        if (featureType === "POINT") {
            return (
                <Stack>
                    <Checkbox
                        isChecked={geometryMerged}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            stageMappingApi.update({
                                attribute: "info",
                                key: "geometryMerged",
                                stage: psId,
                                value: e.target.checked,
                            })
                        }
                    >
                        Latitudes and Longitudes combined
                    </Checkbox>

                    {geometryMerged ? (
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
                                        (val) => val.value === geometryColumn
                                    )}
                                    options={metadata.sourceColumns}
                                    isClearable
                                    placeholder="Select geometry column"
                                    onChange={(e) =>
                                        stageMappingApi.update({
                                            attribute: "info",
                                            key: "geometryColumn",
                                            stage: psId,
                                            value: e?.value,
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
                                                val.value === latitudeColumn
                                        )}
                                        options={metadata.sourceColumns}
                                        isClearable
                                        placeholder="Select latitude column"
                                        onChange={(e) =>
                                            stageMappingApi.update({
                                                attribute: "info",
                                                key: "latitudeColumn",
                                                stage: psId,
                                                value: e?.value,
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
                                                val.value === longitudeColumn
                                        )}
                                        options={metadata.sourceAttributes}
                                        isClearable
                                        placeholder="Select longitude column"
                                        onChange={(e) =>
                                            stageMappingApi.update({
                                                attribute: "info",
                                                key: "longitudeColumn",
                                                stage: psId,
                                                value: e?.value,
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

        if (featureType === "POLYGON") {
            return (
                <Stack
                    alignItems="center"
                    flex={1}
                    direction="row"
                    spacing="20px"
                >
                    <Text>Geometry Column</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={metadata.sourceColumns.find(
                                (val) => val.value === geometryColumn
                            )}
                            options={metadata.sourceColumns}
                            isClearable
                            placeholder="Select geometry column"
                            onChange={(e) =>
                                stageMappingApi.update({
                                    attribute: "info",
                                    key: "geometryColumn",
                                    stage: psId,
                                    value: e?.value,
                                })
                            }
                        />
                    </Box>
                </Stack>
            );
        }
        return null;
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
                <Stack
                    spacing="20px"
                    direction="row"
                    alignItems="center"
                    flex={1}
                >
                    <Text>Event Date Column</Text>
                    <Stack spacing="0" flex={1}>
                        <Checkbox
                            isChecked={customEventDateColumn}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: "info",
                                    stage: psId,
                                    key: "customEventDateColumn",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Custom Event Date Column
                        </Checkbox>
                        <Box>
                            {customEventDateColumn ? (
                                <Input
                                    value={eventDateColumn}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        stageMappingApi.update({
                                            stage: psId,
                                            attribute: "info",
                                            key: "eventDateColumn",
                                            value: e.target.value,
                                        })
                                    }
                                />
                            ) : (
                                <Select<Option, false, GroupBase<Option>>
                                    value={metadata.sourceColumns.find(
                                        (val) => val.value === eventDateColumn
                                    )}
                                    options={metadata.sourceColumns}
                                    placeholder="Select event date column"
                                    isClearable
                                    onChange={(e) =>
                                        stageMappingApi.update({
                                            stage: psId,
                                            attribute: "info",
                                            key: "eventDateColumn",
                                            value: e?.value,
                                        })
                                    }
                                />
                            )}
                        </Box>
                    </Stack>
                </Stack>
                <Stack
                    spacing="20px"
                    direction="row"
                    alignItems="center"
                    flex={1}
                >
                    <Text>Due Date Column</Text>
                    <Stack spacing="0" flex={1}>
                        <Checkbox
                            isChecked={customDueDateColumn}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: "info",
                                    stage: psId,
                                    key: "customDueDateColumn",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Custom Due Date Column
                        </Checkbox>
                        <Box>
                            {customDueDateColumn ? (
                                <Input
                                    value={dueDateColumn}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        stageMappingApi.update({
                                            stage: psId,
                                            attribute: "info",
                                            key: "dueDateColumn",
                                            value: e.target.value,
                                        })
                                    }
                                />
                            ) : (
                                <Select<Option, false, GroupBase<Option>>
                                    value={metadata.sourceColumns.find(
                                        (val) => val.value === dueDateColumn
                                    )}
                                    options={metadata.sourceColumns}
                                    placeholder="Select due date column"
                                    isClearable
                                    onChange={(e) =>
                                        stageMappingApi.update({
                                            stage: psId,
                                            attribute: "info",
                                            key: "dueDateColumn",
                                            value: e?.value,
                                        })
                                    }
                                />
                            )}
                        </Box>
                    </Stack>
                </Stack>
                {determineTrackedEntityOptions()}
            </Stack>
            {determineFeatureType()}
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
