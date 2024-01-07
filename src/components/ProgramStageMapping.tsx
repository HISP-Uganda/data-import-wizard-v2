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
import { IProgramStageDataElement, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent, useState } from "react";
import { FiCheck } from "react-icons/fi";
import {
    $metadata,
    $names,
    $programMapping,
    $programStageMapping,
    stageMappingApi,
} from "../pages/program";
import DestinationIcon from "./DestinationIcon";
import OptionSetMapping from "./OptionSetMapping";
import SourceIcon from "./SourceIcon";

export default function ProgramStageMapping({
    psId,
    programStageDataElements,

    repeatable,
}: {
    psId: string;

    programStageDataElements: IProgramStageDataElement[];

    repeatable: boolean;
}) {
    const programMapping = useStore($programMapping);
    const programStageMapping = useStore($programStageMapping);
    const metadata = useStore($metadata);
    const { source, destination } = useStore($names);
    const updateStage = (
        attributes: { attribute: string; value: any }[],
        stage: string
    ) => {
        for (const { attribute, value } of attributes) {
            stageMappingApi.update({
                key: "" as any,
                attribute,
                stage,
                value,
            });
        }
    };

    const { info, ...rest } = programStageMapping[psId] || {};
    const isChecked = programStageMapping[psId]?.["info"]?.manual || false;
    const createEvents =
        programStageMapping[psId]?.["info"]?.createEvents || false;
    const updateEvents =
        programStageMapping[psId]?.["info"]?.updateEvents || false;
    const eventDateIsUnique =
        programStageMapping[psId]?.["info"]?.eventDateIsUnique || false;
    const eventIdColumnIsManual =
        programStageMapping[psId]?.["info"]?.eventIdColumnIsManual || false;

    const value = programStageMapping[psId]?.["info"]?.eventDateColumn || "";
    const stage = programStageMapping[psId]?.["info"]?.stage || "";
    const stageMapping = programStageMapping[psId];

    const eventIdColumn =
        programStageMapping[psId]?.["info"]?.eventIdColumn || "";

    const [searchString, setSearchString] = useState<string>("");
    const [currentElements, setCurrentElements] = useState(
        programStageDataElements
    );

    const columns: ColumnsType<Partial<IProgramStageDataElement>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={programMapping} />
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
            render: (text, { dataElement, compulsory, allowFutureDate }) => {
                if (dataElement) {
                    const { id, name, optionSetValue, optionSet } = dataElement;
                    return (
                        <Checkbox
                            isChecked={isChecked}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: id,
                                    key: "manual",
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
            render: (text, { dataElement, compulsory, allowFutureDate }) => {
                if (dataElement) {
                    const { id, name, optionSetValue, optionSet } = dataElement;
                    return (
                        <Checkbox
                            isChecked={isChecked}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: id,
                                    key: "manual",
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
                    <SourceIcon mapping={programMapping} />
                    <Text> Source Data Element</Text>
                    <Text>{source}</Text>
                </Stack>
            ),
            key: "source",
            render: (text, { dataElement, compulsory, allowFutureDate }) => {
                if (dataElement) {
                    const { id, name, optionSetValue, optionSet } = dataElement;
                    const isChecked =
                        programStageMapping[psId]?.[id]?.manual || false;

                    if (isChecked) {
                        return (
                            <Input
                                value={value}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    updateStage(
                                        [
                                            {
                                                attribute: `${id}.value`,
                                                value: e.target.value,
                                            },
                                            {
                                                attribute: `info.compulsory`,
                                                value: compulsory,
                                            },
                                            {
                                                attribute: `info.repeatable`,
                                                value: repeatable,
                                            },
                                        ],
                                        psId
                                    )
                                }
                            />
                        );
                    } else {
                        return (
                            <Select<Option, false, GroupBase<Option>>
                                value={metadata.sourceColumns.find(
                                    (val) =>
                                        val.value === stageMapping?.[id]?.value
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
                                                attribute: `info.compulsory`,
                                                value: compulsory,
                                            },
                                            {
                                                attribute: `${id}.value`,
                                                value: e?.value || "",
                                            },
                                            {
                                                attribute: `info.repeatable`,
                                                value: repeatable,
                                            },
                                        ],
                                        psId
                                    )
                                }
                            />
                        );
                    }
                }
                return null;
            },
        },

        {
            title: "Unique",
            align: "center",
            key: "unique",
            render: (text, { dataElement }) => {
                if (dataElement) {
                    const { id, name, optionSetValue, optionSet } = dataElement;

                    const isUnique =
                        programStageMapping[psId]?.[id]?.unique || false;

                    const value = programStageMapping[psId]?.[id]?.value || "";
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
                                destinationOptions={optionSet.options.map(
                                    ({ code, name }) => ({
                                        label: name,
                                        value: code,
                                    })
                                )}
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
                const search = metadata.sourceColumns.find(({ value }) => {
                    return (
                        value ===
                        `last.${psId}.values.${element.dataElement.id}`
                    );
                });
                if (search) {
                    stageMappingApi.update({
                        stage: psId,
                        attribute: element.dataElement.id,
                        key: "value",
                        value: search.value,
                    });
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
                    isChecked={eventDateIsUnique}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        stageMappingApi.update({
                            stage: psId,
                            attribute: "info",
                            key: "eventDateIsUnique",
                            value: e.target.checked,
                        })
                    }
                >
                    Mark Event Date As Unique
                </Checkbox>
            </Stack>
            <Stack direction="row" spacing="20px" alignItems="center">
                {programMapping.dataSource === "dhis2-program" && (
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
                            isChecked={isChecked}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: "info",
                                    stage: psId,
                                    key: "manual",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Custom Event Date Column
                        </Checkbox>
                        <Box>
                            {isChecked ? (
                                <Input
                                    value={value}
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
                                        (val) => val.value === value
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
                    <Text>Event Id Column</Text>
                    <Stack spacing="0" flex={1}>
                        <Checkbox
                            isChecked={eventIdColumnIsManual}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                stageMappingApi.update({
                                    attribute: "info",
                                    stage: psId,
                                    key: "eventIdColumnIsManual",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Custom Event Id Column
                        </Checkbox>
                        <Box>
                            {eventIdColumnIsManual ? (
                                <Input
                                    value={eventIdColumn}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
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
            </Stack>

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
