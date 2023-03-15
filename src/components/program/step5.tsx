import { ChangeEvent, useState } from "react";

import {
    Box,
    Button,
    Checkbox,
    Flex,
    Input,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { Option } from "../../Interfaces";
import { updateProgramStageMapping } from "../../pages/program/Events";
import {
    $columns,
    $program,
    $programMapping,
    $programStageMapping,
} from "../../pages/program/Store";

const Step5 = () => {
    const programMapping = useStore($programMapping);
    const programStageMapping = useStore($programStageMapping);
    const columns = useStore($columns);
    const program = useStore($program);
    const [active, setActive] = useState<string>(
        program.programStages?.[0].id || ""
    );

    const updateStage = (
        attributes: { attribute: string; value: any }[],
        stage: string
    ) => {
        for (const { attribute, value } of attributes) {
            updateProgramStageMapping({
                attribute,
                stage,
                value,
            });
        }
    };

    return (
        <Stack spacing="30px">
            <Flex
                gap="5px"
                flexWrap="wrap"
                bgColor="white"
                p="5px"
                alignContent="flex-start"
            >
                {program.programStages?.map(({ name, id }) => (
                    <Button
                        size="sm"
                        variant="outline"
                        key={id}
                        colorScheme={active === id ? "teal" : ""}
                        onClick={() => setActive(() => id)}
                    >
                        {name || id}
                    </Button>
                ))}
            </Flex>
            {program.programStages?.map(
                ({ id: psId, programStageDataElements }) => {
                    const isChecked =
                        programStageMapping[psId]?.["info"]?.manual || false;

                    const createEvents =
                        programStageMapping[psId]?.["info"]?.createEvents ||
                        false;
                    const updateEvents =
                        programStageMapping[psId]?.["info"]?.updateEvents ||
                        false;
                    const eventDateIsUnique =
                        programStageMapping[psId]?.["info"]
                            ?.eventDateIsUnique || false;

                    const value =
                        programStageMapping[psId]?.["info"]?.eventDateColumn ||
                        "";
                    return (
                        psId === active && (
                            <Stack key={psId} spacing="20px">
                                <Stack
                                    spacing={[1, 5]}
                                    direction={["column", "row"]}
                                >
                                    <Checkbox
                                        colorScheme="green"
                                        isChecked={createEvents}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateProgramStageMapping({
                                                stage: psId,
                                                attribute: `info.createEvents`,
                                                value: e.target.checked,
                                            })
                                        }
                                    >
                                        Create Events
                                    </Checkbox>

                                    <Checkbox
                                        colorScheme="green"
                                        isChecked={updateEvents}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateProgramStageMapping({
                                                stage: psId,
                                                attribute: `info.updateEvents`,
                                                value: e.target.checked,
                                            })
                                        }
                                    >
                                        Update Events
                                    </Checkbox>

                                    <Checkbox
                                        colorScheme="green"
                                        isChecked={eventDateIsUnique}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateProgramStageMapping({
                                                stage: psId,
                                                attribute: `info.eventDateIsUnique`,
                                                value: e.target.checked,
                                            })
                                        }
                                    >
                                        Event Date Is Unique
                                    </Checkbox>
                                </Stack>
                                <Stack spacing="20px">
                                    <Text>Event Date Column</Text>
                                    <Stack direction="row" spacing="20px">
                                        <Checkbox
                                            isChecked={isChecked}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                updateProgramStageMapping({
                                                    attribute: `info.manual`,
                                                    stage: psId,
                                                    value: e.target.checked,
                                                })
                                            }
                                        >
                                            Map Manually
                                        </Checkbox>
                                        <Box w="500px">
                                            {isChecked ? (
                                                <Input
                                                    value={value}
                                                    onChange={(
                                                        e: ChangeEvent<HTMLInputElement>
                                                    ) =>
                                                        updateProgramStageMapping(
                                                            {
                                                                stage: psId,
                                                                attribute: `info.eventDateColumn`,
                                                                value: e.target
                                                                    .value,
                                                            }
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <Select<
                                                    Option,
                                                    false,
                                                    GroupBase<Option>
                                                >
                                                    value={columns.find(
                                                        (val) =>
                                                            val.value === value
                                                    )}
                                                    options={columns}
                                                    isClearable
                                                    onChange={(e) =>
                                                        updateProgramStageMapping(
                                                            {
                                                                stage: psId,
                                                                attribute: `info.eventDateColumn`,
                                                                value:
                                                                    e?.value ||
                                                                    "",
                                                            }
                                                        )
                                                    }
                                                />
                                            )}
                                        </Box>
                                    </Stack>
                                </Stack>
                                <Table size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th py="20px">
                                                Destination Data Element
                                            </Th>
                                            <Th textAlign="center" py="20px">
                                                Compulsory
                                            </Th>
                                            <Th textAlign="center" py="20px">
                                                Manually Map
                                            </Th>
                                            <Th py="20px">
                                                Source Data Element
                                            </Th>
                                            <Th
                                                w="150px"
                                                textAlign="center"
                                                py="20px"
                                            >
                                                Is Unique
                                            </Th>
                                            <Th w="100px" py="20px">
                                                Mapped?
                                            </Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {programStageDataElements.map(
                                            ({
                                                dataElement: { id, name },
                                                compulsory,
                                                allowFutureDate,
                                            }) => {
                                                const isChecked =
                                                    programStageMapping[psId]?.[
                                                        id
                                                    ]?.manual || false;
                                                const isUnique =
                                                    programStageMapping[psId]?.[
                                                        id
                                                    ]?.unique || false;

                                                const value =
                                                    programStageMapping[psId]?.[
                                                        id
                                                    ]?.value || "";
                                                return (
                                                    <Tr key={id}>
                                                        <Td w="400px">
                                                            {name}
                                                        </Td>
                                                        <Td
                                                            w="100px"
                                                            textAlign="center"
                                                        >
                                                            <Checkbox
                                                                isChecked={
                                                                    compulsory
                                                                }
                                                                isReadOnly
                                                            />
                                                        </Td>
                                                        <Td
                                                            textAlign="center"
                                                            w="200px"
                                                        >
                                                            <Checkbox
                                                                isChecked={
                                                                    isChecked
                                                                }
                                                                onChange={(
                                                                    e: ChangeEvent<HTMLInputElement>
                                                                ) =>
                                                                    updateProgramStageMapping(
                                                                        {
                                                                            attribute: `${id}.manual`,
                                                                            stage: psId,
                                                                            value: e
                                                                                .target
                                                                                .checked,
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                        </Td>
                                                        <Td>
                                                            {isChecked ? (
                                                                <Input
                                                                    value={
                                                                        value
                                                                    }
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
                                                                                    value: String(
                                                                                        compulsory
                                                                                    ),
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
                                                                    value={columns.find(
                                                                        (val) =>
                                                                            val.value ===
                                                                            value
                                                                    )}
                                                                    options={
                                                                        columns
                                                                    }
                                                                    isClearable
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateStage(
                                                                            [
                                                                                {
                                                                                    attribute: `info.compulsory`,
                                                                                    value: String(
                                                                                        compulsory
                                                                                    ),
                                                                                },
                                                                                {
                                                                                    attribute: `${id}.value`,
                                                                                    value:
                                                                                        e?.value ||
                                                                                        "",
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
                                                                isChecked={
                                                                    isUnique
                                                                }
                                                                onChange={(
                                                                    e: ChangeEvent<HTMLInputElement>
                                                                ) =>
                                                                    updateProgramStageMapping(
                                                                        {
                                                                            attribute: `${id}.unique`,
                                                                            stage: psId,
                                                                            value: e
                                                                                .target
                                                                                .checked,
                                                                        }
                                                                    )
                                                                }
                                                            />
                                                        </Td>
                                                        <Td></Td>
                                                    </Tr>
                                                );
                                            }
                                        )}
                                    </Tbody>
                                </Table>
                            </Stack>
                        )
                    );
                }
            )}
        </Stack>
    );
};

export default Step5;
