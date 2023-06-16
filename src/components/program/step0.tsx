import { usePagination } from "@ajna/pagination";
import {
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spinner,
    Stack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";

import { useDataEngine } from "@dhis2/app-runtime";
import { IProgramMapping } from "data-import-wizard-utils";
import { useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";

import {
    attributeMappingApi,
    optionMappingApi,
    ouMappingApi,
    programApi,
    programMappingApi,
    stageMappingApi,
} from "../../pages/program/Store";
import { loadPreviousMapping, loadProgram, useNamespace } from "../../Queries";
import { actionApi, stepper } from "../../Store";
import Progress from "../Progress";

const Step0 = () => {
    const engine = useDataEngine();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const { isLoading, isSuccess, isError, error, data } =
        useNamespace<IProgramMapping>("iw-program-mapping");
    const outerLimit = 4;
    const innerLimit = 4;

    const {
        pages,
        pagesCount,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
    } = usePagination({
        total: data?.length || 0,
        limits: {
            outer: outerLimit,
            inner: innerLimit,
        },
        initialState: {
            pageSize: 10,
            currentPage: 1,
        },
    });
    const loadMapping = async (namespaceKey: string) => {
        actionApi.edit();
        setMessage(() => "Fetching saved mapping");
        onOpen();
        const previousMappings = await loadPreviousMapping(
            engine,
            [
                "iw-program-mapping",
                "iw-ou-mapping",
                "iw-attribute-mapping",
                "iw-stage-mapping",
                "iw-option-mapping",
            ],
            namespaceKey
        );
        setMessage(() => "Loading program for saved mapping");
        const program = await loadProgram(
            engine,
            previousMappings["iw-program-mapping"].program || ""
        );
        programApi.set(program);
        stageMappingApi.set(previousMappings["iw-stage-mapping"]);
        attributeMappingApi.set(previousMappings["iw-attribute-mapping"] || {});
        ouMappingApi.set(previousMappings["iw-ou-mapping"] || {});
        programMappingApi.set(previousMappings["iw-program-mapping"] || {});
        optionMappingApi.set(previousMappings["iw-option-mapping"] || {});
        onClose();
        stepper.next();
    };

    const deleteMapping = async (id: string) => {
        const mutation: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-program-mapping",
        };
        const mutation2: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-ou-mapping",
        };
        const mutation3: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-attribute-mapping",
        };
        const mutation4: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-stage-mapping",
        };
        const mutation5: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-option-mapping",
        };

        try {
            engine.mutate(mutation);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation2);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation3);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation4);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation5);
        } catch (e: any) {
            console.log(e?.message);
        }
        await queryClient.cancelQueries(["namespaces", "iw-program-mapping"]);
        queryClient.setQueryData<IProgramMapping[]>(
            ["namespaces", "iw-program-mapping"],
            () => {
                return data?.filter(({ id: programId }) => id !== programId);
            }
        );
    };
    return (
        <Stack flex={1}>
            {isLoading && (
                <Stack h="100%" alignItems="center" justifyContent="center">
                    <Spinner />
                </Stack>
            )}
            {isSuccess && (
                <Table>
                    <Thead>
                        <Tr>
                            <Th w="100px">ID</Th>
                            <Th>Name</Th>
                            <Th>Description</Th>
                            <Th w="200px">Created</Th>
                            <Th w="200px">Updated At</Th>
                            <Th w="48px">Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data
                            .slice(
                                currentPage * pageSize - pageSize,
                                pageSize * currentPage
                            )
                            .map(
                                ({
                                    id,
                                    lastUpdated,
                                    created,
                                    name,
                                    description,
                                }) => (
                                    <Tr key={id} _hover={{ bg: "gray.50" }}>
                                        <Td>{id}</Td>
                                        <Td>{name}</Td>
                                        <Td>{description}</Td>
                                        <Td>{created}</Td>
                                        <Td>{lastUpdated}</Td>
                                        <Td>
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={
                                                        <BiDotsVerticalRounded
                                                            style={{
                                                                width: "24px",
                                                                height: "24px",
                                                            }}
                                                        />
                                                    }
                                                    bg="none"
                                                />
                                                <MenuList>
                                                    <MenuItem
                                                        onClick={() =>
                                                            loadMapping(id)
                                                        }
                                                    >
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem>
                                                        Download
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() =>
                                                            deleteMapping(id)
                                                        }
                                                    >
                                                        Delete
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                )
                            )}
                    </Tbody>
                </Table>
            )}

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
            {isError && <pre>{JSON.stringify(error)}</pre>}
        </Stack>
    );
};

export default Step0;
