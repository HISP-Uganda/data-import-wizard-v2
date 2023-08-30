import { usePagination } from "@ajna/pagination";
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
    Table,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
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
} from "../pages/program/Store";
import DestinationIcon from "./DestinationIcon";
import Paginated from "./Paginated";
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

    const eventIdColumn =
        programStageMapping[psId]?.["info"]?.eventIdColumn || "";

    const [searchString, setSearchString] = useState<string>("");
    const [currentElements, setCurrentElements] = useState(
        programStageDataElements
    );

    const outerLimit = 4;
    const innerLimit = 4;

    // pagination hook
    const {
        pages,
        pagesCount,
        currentPage,
        setCurrentPage,

        pageSize,
        setPageSize,
    } = usePagination({
        total: programStageDataElements.length,
        limits: {
            outer: outerLimit,
            inner: innerLimit,
        },
        initialState: {
            pageSize: 5,
            currentPage: 1,
        },
    });

    const filterUnits = (checked: boolean) => {
        const mapped = Object.keys(rest);
        if (checked) {
            setCurrentElements(() =>
                programStageDataElements.filter(
                    ({ dataElement: { id } }) => mapped.indexOf(id) !== -1
                )
            );
            setCurrentPage(1);
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

    const handlePageChange = (nextPage: number): void => {
        setCurrentPage(nextPage);
    };

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const pageSize = Number(event.target.value);
        setPageSize(pageSize);
    };

    return (
        <Stack key={psId} spacing="20px">
            <Stack spacing={[1, 5]} direction={["column", "row"]}>
                <Checkbox
                    colorScheme="green"
                    isChecked={createEvents}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        stageMappingApi.update({
                            stage: psId,
                            attribute: "info",
                            key: "createEvents",
                            value: e.target.checked,
                        })
                    }
                >
                    Create Events
                </Checkbox>

                <Checkbox
                    colorScheme="green"
                    isChecked={updateEvents}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        stageMappingApi.update({
                            stage: psId,
                            attribute: "info",
                            key: "updateEvents",
                            value: e.target.checked,
                        })
                    }
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
            <Stack direction="row" spacing="20px">
                <Stack
                    spacing="20px"
                    direction="row"
                    alignItems="center"
                    w="50%"
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
                    w="50%"
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

                {programMapping.dataSource === "dhis2" && (
                    <Stack spacing="20px" flex={1}>
                        <Text>Specific Stage</Text>
                        <Box w="100%">
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

            <Table size="sm">
                <Thead>
                    <Tr>
                        <Th textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon />
                                <Text> Destination Data Element</Text>
                                <Text>{destination}</Text>
                            </Stack>
                        </Th>
                        <Th textAlign="center" textTransform="none">
                            Compulsory
                        </Th>
                        <Th textAlign="center" textTransform="none">
                            Custom
                        </Th>
                        <Th textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon />
                                <Text> Source Data Element</Text>
                                <Text>{source}</Text>
                            </Stack>
                        </Th>
                        <Th w="150px" textAlign="center" textTransform="none">
                            Is Unique
                        </Th>
                        <Th w="75px" textTransform="none">
                            Mapped?
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {currentElements
                        .slice(
                            currentPage * pageSize - pageSize,
                            pageSize * currentPage
                        )
                        .map(
                            ({
                                dataElement: { id, name },
                                compulsory,
                                allowFutureDate,
                            }) => {
                                const isChecked =
                                    programStageMapping[psId]?.[id]?.manual ||
                                    false;
                                const isUnique =
                                    programStageMapping[psId]?.[id]?.unique ||
                                    false;

                                const value =
                                    programStageMapping[psId]?.[id]?.value ||
                                    "";
                                return (
                                    <Tr key={id}>
                                        <Td w="400px">{name}</Td>
                                        <Td w="100px" textAlign="center">
                                            <Checkbox
                                                isChecked={compulsory}
                                                isReadOnly
                                            />
                                        </Td>
                                        <Td textAlign="center" w="200px">
                                            <Checkbox
                                                isChecked={isChecked}
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    stageMappingApi.update({
                                                        attribute: id,
                                                        key: "manual",
                                                        stage: psId,
                                                        value: e.target.checked,
                                                    })
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            {isChecked ? (
                                                <Input
                                                    value={value}
                                                    onChange={(
                                                        e: ChangeEvent<HTMLInputElement>
                                                    ) =>
                                                        updateStage(
                                                            [
                                                                {
                                                                    attribute: `${id}.value`,
                                                                    value: e
                                                                        .target
                                                                        .value,
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
                                            ) : (
                                                <Select<
                                                    Option,
                                                    false,
                                                    GroupBase<Option>
                                                >
                                                    value={metadata.sourceColumns.find(
                                                        (val) =>
                                                            val.value === value
                                                    )}
                                                    options={metadata.sourceColumns.filter(
                                                        ({ value }) => {
                                                            if (stage) {
                                                                return (
                                                                    value.indexOf(
                                                                        stage
                                                                    ) !== -1
                                                                );
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
                                                                    value:
                                                                        e?.value ||
                                                                        "",
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
                                            )}
                                        </Td>
                                        <Td textAlign="center">
                                            <Checkbox
                                                isChecked={isUnique}
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    stageMappingApi.update({
                                                        attribute: id,
                                                        key: "unique",
                                                        stage: psId,
                                                        value: e.target.checked,
                                                    })
                                                }
                                            />
                                        </Td>
                                        <Td>
                                            {rest[id]?.value && (
                                                <Icon
                                                    as={FiCheck}
                                                    color="green.400"
                                                    fontSize="2xl"
                                                />
                                            )}
                                        </Td>
                                    </Tr>
                                );
                            }
                        )}
                </Tbody>

                <Tfoot>
                    <Tr>
                        <Td colSpan={6} textAlign="right">
                            Mapped{" "}
                            {
                                Object.values(rest).filter(
                                    ({ value }) => !!value
                                ).length
                            }{" "}
                            of {currentElements.length}
                        </Td>
                    </Tr>
                </Tfoot>
            </Table>

            <Paginated
                pages={pages}
                pagesCount={pagesCount}
                currentPage={currentPage}
                handlePageSizeChange={handlePageSizeChange}
                handlePageChange={handlePageChange}
                pageSize={pageSize}
            />
        </Stack>
    );
}
