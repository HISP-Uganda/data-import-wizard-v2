import {
    Box,
    Button,
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { useConfig, useDataEngine } from "@dhis2/app-runtime";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GroupBase, Select } from "chakra-react-select";
import { generateUid, ISchedule, Option } from "data-import-wizard-utils";
import dayjs from "dayjs";
import { ChangeEvent, useState } from "react";
import { useNamespace } from "../Queries";
import ProgramMappingSelect from "./ProgramMappingSelect";

const scheduleTypes: Option[] = [
    { label: "Aggregate Mapping", value: "aggregate" },
    { label: "Program Mapping", value: "program" },
];

const Schedule = () => {
    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [isScheduleCustom, setIsScheduleCustom] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [action, setAction] = useState<string>("create");
    const queryClient = useQueryClient();
    const schedulePeriods = (): Option[] => {
        return [
            { label: "Every5s", value: "*/5 * * * * *" },
            { label: "Minutely", value: "* * * * *" },
            { label: "Every5m", value: "*/5 * * * *" },
            { label: "Hourly", value: "0 * * * *" },
            { label: "Daily", value: "0 0 * * *" },
            { label: "Weekly", value: `0 0 * * add` },
            { label: "Monthly", value: `0 0 add * *` },
            { label: "BiMonthly", value: `0 0 add */2 *` },
            { label: "Quarterly", value: `0 0 add */3 *` },
            { label: "SixMonthly", value: `0 0 add */6 *` },
            { label: "Yearly", value: `0 0 add 1 *` },
            { label: "FinancialJuly", value: `0 0 add 7 *` },
            { label: "FinancialApril", value: `0 0 add 4 *` },
            { label: "FinancialOct", value: `0 0 add 10 *` },
        ];
    };

    const [schedule, setSchedule] = useState<Partial<ISchedule>>({});

    const { isLoading, isSuccess, isError, error, data } =
        useNamespace<ISchedule>("iw-schedules");

    const update = async (schedule: Partial<ISchedule>) => {
        await queryClient.cancelQueries(["namespaces", "iw-schedules"]);
        queryClient.setQueryData<ISchedule[]>(
            ["namespaces", "iw-schedules"],
            (old) =>
                old?.map((s) => {
                    if (s.id === schedule.id) {
                        return { ...s, ...schedule };
                    }
                    return s;
                }),
        );
    };

    const createSchedule = () => {
        setSchedule(() => {
            return {
                id: generateUid(),
                createdAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
                type: "tracker",
                schedule: "0 0 * * *",
                name: "",
                description: "",
                schedulingSeverURL: "",
                status: "created",
                url: "",
                additionalDays: 0,
            };
        });
        onOpen();
    };

    const updateSchedule = (key: keyof ISchedule, value: any) => {
        setSchedule((prev) => {
            return { ...prev, [key]: value };
        });
    };

    const saveSchedule = async () => {
        setLoading(() => true);
        const mutation: any = {
            type: action,
            resource: `dataStore/iw-schedules/${schedule.id}`,
            data: {
                ...schedule,
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            },
        };
        await engine.mutate(mutation);
        setLoading(() => false);
        onClose();
    };

    const edit = (schedule: Partial<ISchedule>) => {
        setSchedule(() => schedule);
        setAction(() => "update");
        onOpen();
    };

    const start = async (schedule: Partial<ISchedule>) => {
        await axios.post(`${schedule.schedulingSeverURL}/schedule`, {
            ...schedule,
            additionalDays: schedule.additionalDays
                ? Number(schedule.additionalDays)
                : 0,
            lastRun: schedule.lastRun ?? "",
            immediate: schedule.immediate ?? false,
        });
        await update({ status: "running" });
    };

    const stop = async (schedule: Partial<ISchedule>) => {
        await axios.delete(
            `${schedule.schedulingSeverURL}/schedule/${schedule.id}`,
        );
        await update({ status: "stopped" });
    };
    return (
        <Stack p="10px">
            <Box textAlign="right" h="48px">
                <Button onClick={() => createSchedule()}>Add Schedule</Button>
            </Box>
            {isLoading && (
                <Stack h="100%" alignItems="center" justifyContent="center">
                    <Spinner />
                </Stack>
            )}
            {isSuccess && (
                <Stack>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Schedule Id</Th>
                                <Th>Name</Th>
                                <Th>Description</Th>
                                <Th>Mapping</Th>
                                <Th>Created At</Th>
                                <Th>Last Updated At</Th>
                                <Th>Status</Th>
                                <Th>Last Run</Th>
                                <Th>Next Run</Th>
                                <Th w="300px">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {data.map((s) => (
                                <Tr
                                    key={s.id}
                                    borderColor="green.100"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Td>{s.id}</Td>
                                    <Td>{s.name}</Td>
                                    <Td>{s.description}</Td>
                                    <Td>{s.mapping}</Td>
                                    <Td>{s.createdAt}</Td>
                                    <Td>{s.updatedAt}</Td>
                                    <Td>{s.status}</Td>
                                    <Td>{s.lastRun}</Td>
                                    <Td>{s.nextRun}</Td>
                                    <Td>
                                        <Stack direction="row" spacing="10px">
                                            {(s.status === "created" ||
                                                !s.status) && (
                                                <Button
                                                    size="xs"
                                                    colorScheme="blue"
                                                    onClick={() => edit(s)}
                                                >
                                                    Edit
                                                </Button>
                                            )}

                                            {(s.status === "stopped" ||
                                                s.status === "created" ||
                                                !s.status) && (
                                                <Button
                                                    size="xs"
                                                    colorScheme="green"
                                                    onClick={() => start(s)}
                                                >
                                                    Start
                                                </Button>
                                            )}

                                            {(s.status === "stopped" ||
                                                s.status === "created" ||
                                                !s.status) && (
                                                <Button
                                                    size="xs"
                                                    colorScheme="red"
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                            <Button
                                                size="xs"
                                                onClick={() => stop(s)}
                                            >
                                                Stop
                                            </Button>
                                        </Stack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Stack>
            )}
            {isError && <pre>{JSON.stringify(error)}</pre>}
            <Modal
                onClose={onClose}
                isOpen={isOpen}
                size="2xl"
                isCentered
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>New Schedule</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody p="20px">
                        <Stack>
                            <Stack spacing="10px">
                                <Stack>
                                    <Text>Schedule Name</Text>
                                    <Input
                                        value={schedule.name}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            updateSchedule(
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Stack>
                                <Stack>
                                    <Text>Description</Text>
                                    <Textarea
                                        value={schedule.description}
                                        onChange={(e) =>
                                            updateSchedule(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Stack>
                                <Stack>
                                    <Text>Scheduling Server</Text>
                                    <Input
                                        value={schedule.schedulingSeverURL}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) =>
                                            updateSchedule(
                                                "schedulingSeverURL",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Stack>
                                <Stack>
                                    <Text>Mapping</Text>
                                    <Select<Option, false, GroupBase<Option>>
                                        options={scheduleTypes}
                                        isClearable
                                        value={scheduleTypes.find(
                                            (scheduleType) =>
                                                scheduleType.value ===
                                                schedule.type,
                                        )}
                                        onChange={(e) =>
                                            updateSchedule("type", e?.value)
                                        }
                                    />
                                </Stack>

                                <Stack>
                                    <Text>Schedule Type</Text>
                                    <ProgramMappingSelect
                                        value={schedule.mapping}
                                        onChange={(value) =>
                                            updateSchedule("mapping", value?.id)
                                        }
                                    />
                                </Stack>

                                <Stack direction="row">
                                    <Checkbox
                                        isChecked={isScheduleCustom}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) => {
                                            e.persist();
                                            setIsScheduleCustom(
                                                () => e.target.checked,
                                            );
                                        }}
                                    >
                                        Custom Period
                                    </Checkbox>
                                    {isScheduleCustom && (
                                        <Input
                                            w="150px"
                                            value={schedule.schedule}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                updateSchedule(
                                                    "schedule",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    )}
                                </Stack>

                                <Stack direction="row" spacing="10px">
                                    <Stack direction="row" alignItems="center">
                                        <Text>Additional Days</Text>
                                        <Input
                                            value={schedule.additionalDays}
                                            w="60px"
                                            textAlign="center"
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                            ) => {
                                                updateSchedule(
                                                    "additionalDays",
                                                    e.target.value,
                                                );
                                            }}
                                        />
                                    </Stack>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        flex={1}
                                    >
                                        <Text>Schedule Period</Text>
                                        <Box flex={1}>
                                            <Select<
                                                Option,
                                                false,
                                                GroupBase<Option>
                                            >
                                                options={schedulePeriods()}
                                                isClearable
                                                value={schedulePeriods().find(
                                                    (schedulePeriod) =>
                                                        schedulePeriod.value ===
                                                        schedule.schedule,
                                                )}
                                                onChange={(e) =>
                                                    updateSchedule(
                                                        "schedule",
                                                        e?.value,
                                                    )
                                                }
                                            />
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="red"
                            mr={3}
                            onClick={onClose}
                            isDisabled={loading}
                        >
                            Close
                        </Button>
                        <Button
                            isLoading={loading}
                            onClick={() => saveSchedule()}
                        >
                            Save Schedule
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Stack>
    );
};

export default Schedule;
