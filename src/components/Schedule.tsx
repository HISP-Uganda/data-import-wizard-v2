import {
    Box,
    Button,
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
    Text,
    Textarea,
    useDisclosure,
} from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { GroupBase, Select } from "chakra-react-select";
import { useMemo } from "react";
import { ISchedule } from "../pages/schedules/Interfaces";
import { useNamespace } from "../Queries";
import TableDisplay from "./TableDisplay";
import { Option } from "data-import-wizard-utils";

const scheduleTypes: Option[] = [
    { label: "Aggregate Mapping", value: "aggregate" },
    { label: "Program Mapping", value: "program" },
];

const Schedule = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { isLoading, isSuccess, isError, error, data } =
        useNamespace<ISchedule>("iw-schedules");

    const columns = useMemo<ColumnDef<ISchedule>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                size: 20,
            },
        ],
        []
    );
    return (
        <Stack p="10px">
            <Box textAlign="right">
                <Button onClick={() => onOpen()}>Add Schedule</Button>
            </Box>
            {isLoading && <Spinner />}
            {isSuccess && (
                <TableDisplay<ISchedule>
                    columns={columns}
                    generatedData={data}
                    queryKey={["schedules"]}
                />
            )}
            {isError && <pre>{JSON.stringify(error)}</pre>}

            <Modal
                onClose={onClose}
                isOpen={isOpen}
                size="6xl"
                isCentered
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>New Schedule</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody m="0" p="10px">
                        <Stack>
                            <Stack spacing="30px">
                                <Stack>
                                    <Text>Scheduling Server</Text>
                                    <Input />
                                </Stack>
                                <Stack>
                                    <Text>Schedule Name</Text>
                                    <Input />
                                </Stack>
                                <Stack>
                                    <Text>Schedule Type</Text>
                                    <Select<Option, false, GroupBase<Option>>
                                        options={scheduleTypes}
                                        isClearable
                                    />
                                </Stack>
                                <Stack>
                                    <Text>Description</Text>
                                    <Textarea />
                                </Stack>
                            </Stack>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="ghost">Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Stack>
    );
};

export default Schedule;
