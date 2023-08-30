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
    useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";

import { useDataEngine } from "@dhis2/app-runtime";
import {
    convertToDHIS2,
    convertToGoData,
    fetchRemote,
    fetchTrackedEntityInstances,
    flattenTrackedEntityInstances,
    getGoDataToken,
    getLowestLevelParents,
    GODataTokenGenerationResponse,
    IGoDataData,
    IProgramMapping,
    loadPreviousGoData,
    makeMetadata,
    makeValidation,
    Mapping,
    postRemote,
    processPreviousInstances,
    programStageUniqElements,
    programUniqAttributes,
    putRemote,
    StageMapping,
} from "data-import-wizard-utils";
import { useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";

import { useStore } from "effector-react";
import { chunk } from "lodash";
import {
    attributeMappingApi,
    currentSourceOptionsApi,
    goDataApi,
    goDataOptionsApi,
    optionMappingApi,
    ouMappingApi,
    programApi,
    programMappingApi,
    remoteOrganisationsApi,
    stageMappingApi,
    tokensApi,
} from "../../pages/program/Store";
import { loadPreviousMapping, loadProgram, useNamespace } from "../../Queries";
import { $version, actionApi, stepper } from "../../Store";
import Progress from "../Progress";

const Step0 = () => {
    const toast = useToast();
    const engine = useDataEngine();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const [inserted, setInserted] = useState<any[]>([]);
    const [errored, setErrored] = useState<any[]>([]);
    const [conflicted, setConflicted] = useState<any[]>([]);
    const [updated, setUpdated] = useState<any[]>([]);
    const version = useStore($version);
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

    const getPreviousMapping = async (id: string) => {
        const previousMappings = await loadPreviousMapping(
            engine,
            [
                "iw-program-mapping",
                "iw-ou-mapping",
                "iw-attribute-mapping",
                "iw-stage-mapping",
                "iw-option-mapping",
            ],
            id
        );

        const programMapping: Partial<IProgramMapping> =
            previousMappings["iw-program-mapping"] || {};
        const programStageMapping: StageMapping =
            previousMappings["iw-stage-mapping"] || {};
        const attributeMapping: Mapping =
            previousMappings["iw-attribute-mapping"] || {};
        const organisationUnitMapping: Mapping =
            previousMappings["iw-ou-mapping"] || {};
        const optionMapping: Record<string, string> =
            previousMappings["iw-option-mapping"] || {};

        return {
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
        };
    };

    const run = async (id: string) => {
        onOpen();
        setMessage(() => "Fetching saved mapping");
        const {
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
        } = await getPreviousMapping(id);
        setMessage(() => "Loading program for saved mapping");

        const program = await loadProgram(engine, programMapping.program || "");
        const { attributes, elements } = makeValidation(program);
        const {
            params,
            basicAuth,
            hasNextLink,
            headers,
            password,
            username,
            ...rest
        } = programMapping.authentication || {};

        if (programMapping.dataSource === "godata") {
            const token = await getGoDataToken(programMapping);
            const { options, organisations, outbreak, tokens } =
                await loadPreviousGoData(token, programMapping);
            if (programMapping.isSource) {
                const prev = await fetchRemote<Array<Partial<IGoDataData>>>(
                    rest,
                    `api/outbreaks/${outbreak.id}/cases`,
                    {
                        auth: {
                            param: "access_token",
                            value: token,
                            forUpdates: false,
                        },
                    }
                );
                await fetchTrackedEntityInstances(
                    { engine },
                    programMapping,
                    {},
                    [],
                    false,
                    async (trackedEntityInstances, page) => {
                        setMessage(
                            () => `Working on page ${page} for tracked entities`
                        );
                        const { inserts, updates } = convertToGoData(
                            flattenTrackedEntityInstances({
                                trackedEntityInstances,
                            }),
                            organisationUnitMapping,
                            attributeMapping,
                            outbreak,
                            optionMapping,
                            tokens,
                            prev
                        );

                        const {
                            params,
                            basicAuth,
                            hasNextLink,
                            headers,
                            password,
                            username,
                            ...rest
                        } = programMapping.authentication || {};
                        try {
                            setMessage(() => "Getting auth token");
                            const response =
                                await postRemote<GODataTokenGenerationResponse>(
                                    rest,
                                    "api/users/login",
                                    {
                                        email: username,
                                        password,
                                    }
                                );
                            if (response) {
                                const token = response.id;
                                for (const { id, ...goDataCase } of [
                                    ...inserts,
                                    ...updates,
                                ]) {
                                    try {
                                        if (id) {
                                            const response =
                                                await putRemote<any>(
                                                    {
                                                        ...rest,
                                                    },
                                                    `api/outbreaks/${outbreak.id}/cases/${id}`,
                                                    goDataCase,
                                                    {
                                                        auth: {
                                                            param: "access_token",
                                                            value: token,
                                                        },
                                                    }
                                                );
                                            setUpdated((prev) => [
                                                ...prev,
                                                response,
                                            ]);
                                        } else {
                                            const response =
                                                await postRemote<any>(
                                                    {
                                                        ...rest,
                                                    },
                                                    `api/outbreaks/${outbreak.id}/cases`,
                                                    goDataCase,
                                                    {
                                                        auth: {
                                                            param: "access_token",
                                                            value: token,
                                                        },
                                                    }
                                                );
                                            setInserted((prev) => [
                                                ...prev,
                                                response,
                                            ]);
                                        }
                                    } catch (error: any) {
                                        const keys = Object.keys(error);
                                        if (keys.indexOf("response") !== -1) {
                                            const { error: e } =
                                                error.response.data;
                                            setErrored((prev) => [
                                                ...prev,
                                                { ...goDataCase, ...e },
                                            ]);
                                            toast({
                                                title: "Post/Put Failed",
                                                description: e?.message,
                                                status: "error",
                                                duration: 9000,
                                                isClosable: true,
                                            });
                                        } else {
                                            setErrored((prev) => [
                                                ...prev,
                                                {
                                                    ...goDataCase,
                                                    message: error?.message,
                                                },
                                            ]);
                                            toast({
                                                title: "Post/Put Failed",
                                                description: error?.message,
                                                status: "error",
                                                duration: 9000,
                                                isClosable: true,
                                            });
                                        }
                                    }
                                }
                            }
                        } catch (error: any) {
                            toast({
                                title: "Fetch Failed",
                                description: error?.message,
                                status: "error",
                                duration: 9000,
                                isClosable: true,
                            });
                        }
                    }
                );
            } else {
                const goDataData = await fetchRemote<any[]>(
                    {
                        ...rest,
                        params: {
                            auth: { param: "access_token", value: token },
                        },
                    },
                    `api/outbreaks/${programMapping.remoteProgram}/cases`
                );
                const metadata = makeMetadata(program, programMapping, {
                    data: goDataData,
                    programStageMapping,
                    attributeMapping,
                    remoteOrganisations: getLowestLevelParents(organisations),
                    goData: outbreak,
                    tokens,
                });
                for (const current of chunk(goDataData, 25)) {
                    await fetchTrackedEntityInstances(
                        { engine },
                        programMapping,
                        {},
                        metadata.uniqueAttributeValues,
                        true,
                        async (trackedEntityInstances) => {
                            const previous = processPreviousInstances(
                                trackedEntityInstances,
                                programUniqAttributes(attributeMapping),
                                programStageUniqElements(programStageMapping),
                                programMapping.program || ""
                            );
                            const results = await convertToDHIS2(
                                previous,
                                current,
                                programMapping,
                                organisationUnitMapping,
                                attributeMapping,
                                programStageMapping,
                                optionMapping,
                                version,
                                program,
                                elements,
                                attributes
                            );
                        }
                    );
                }
            }
        }

        if (["api", "godata"].indexOf(programMapping.dataSource || "") !== -1) {
        }
        onClose();
    };
    const loadMapping = async (namespaceKey: string) => {
        onOpen();
        actionApi.edit();
        setMessage(() => "Fetching saved mapping");
        const {
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
        } = await getPreviousMapping(namespaceKey);
        setMessage(() => "Loading program for saved mapping");
        const program = await loadProgram(engine, programMapping.program || "");
        programApi.set(program);
        stageMappingApi.set(programStageMapping);
        attributeMappingApi.set(attributeMapping);
        ouMappingApi.set(organisationUnitMapping);
        programMappingApi.set(programMapping);
        optionMappingApi.set(optionMapping);

        if (programMapping.dataSource === "godata") {
            const token = await getGoDataToken(programMapping);
            const { options, organisations, outbreak, tokens, goDataOptions } =
                await loadPreviousGoData(token, programMapping);
            goDataApi.set(outbreak);
            tokensApi.set(tokens);
            goDataOptionsApi.set(goDataOptions);
            currentSourceOptionsApi.set(options);
            remoteOrganisationsApi.set(getLowestLevelParents(organisations));
        }
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
        toast({
            title: "Mapping deleted.",
            description: "Mapping has been deleted",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
    };
    return (
        <Stack flex={1}>
            {isLoading && (
                <Stack h="100%" alignItems="center" justifyContent="center">
                    <Spinner />
                </Stack>
            )}
            {isSuccess && (
                <Table size="sm">
                    <Thead>
                        <Tr>
                            {/* <Th w="100px">ID</Th> */}
                            <Th>Name</Th>
                            <Th>Description</Th>
                            <Th>Source</Th>
                            <Th>Destination</Th>
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
                                    destination,
                                    source,
                                }) => (
                                    <Tr key={id} _hover={{ bg: "gray.50" }}>
                                        {/* <Td>{id}</Td> */}
                                        <Td>{name}</Td>
                                        <Td>{description}</Td>
                                        <Td>{source}</Td>
                                        <Td>{destination}</Td>
                                        <Td>{created}</Td>
                                        <Td>{lastUpdated}</Td>
                                        <Td>
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={
                                                        <BiDotsVerticalRounded
                                                            style={{
                                                                width: "20px",
                                                                height: "20px",
                                                            }}
                                                        />
                                                    }
                                                    bg="none"
                                                />
                                                <MenuList>
                                                    <MenuItem
                                                        onClick={() => run(id)}
                                                    >
                                                        Run
                                                    </MenuItem>
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
