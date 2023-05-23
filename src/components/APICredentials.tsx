import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
    Button,
    Checkbox,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Spinner,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import {
    getLowestLevelParents,
    GODataTokenGenerationResponse,
    IGoData,
    IGoDataOrgUnit,
    IProgramMapping,
    IProgram,
    GODataOption,
} from "data-import-wizard-utils";
import { Event } from "effector";
import { useStore } from "effector-react";
import { getOr, isEmpty } from "lodash/fp";
import { ChangeEvent, useRef, useState } from "react";
import {
    $metadataAuthApi,
    $programMapping,
    $token,
    dhis2ProgramApi,
    goDataApi,
    goDataOptionsApi,
    programMappingApi,
    remoteOrganisationsApi,
} from "../pages/program/Store";
import { fetchRemote, makeQueryKeys, useRemoteGet } from "../Queries";
import { generateUid } from "../utils/uid";
import { APICredentialsModal } from "./APICredentialsModal";

const RemoteOutbreaks = ({ onClose }: { onClose: () => void }) => {
    const programMapping = useStore($programMapping);
    const token = useStore($token);
    const { isLoading, isError, isSuccess, error, data } = useRemoteGet<
        IGoData[],
        GODataTokenGenerationResponse
    >({
        authentication: programMapping.authentication,
        getToken: true,
        tokenField: "id",
        addTokenTo: "params",
        tokenName: "access_token",
        tokenGenerationURL: "api/users/login",
        tokenGenerationPasswordField: "password",
        tokenGenerationUsernameField: "email",
        url: "api/outbreaks",
    });

    const onRowSelect = async (outbreak: IGoData) => {
        const organisations = await fetchRemote<IGoDataOrgUnit[]>(
            {
                ...programMapping.authentication,
                params: { auth: { param: "access_token", value: token } },
            },
            "api/locations"
        );

        const goDataOptions = await fetchRemote<GODataOption[]>(
            {
                ...programMapping.authentication,
                params: { auth: { param: "access_token", value: token } },
            },
            "api/reference-data"
        );
        goDataOptionsApi.set(goDataOptions);
        goDataApi.set(outbreak);
        if (organisations) {
            remoteOrganisationsApi.set(getLowestLevelParents(organisations));
        }
        programMappingApi.updateMany({
            manuallyMapOrgUnitColumn: true,
            orgUnitColumn: "addresses[0].locationId",
            createEnrollments: true,
            createEntities: true,
            updateEntities: true,
            incidentDateColumn: "dateOfOnset",
            enrollmentDateColumn: "dateOfOnset",
        });
        onClose();
    };
    return (
        <Stack>
            {isLoading && <Spinner />}
            {isSuccess && !isEmpty(data) && (
                <Table colorScheme="facebook">
                    <Thead>
                        <Tr>
                            <Th>Id</Th>
                            <Th>Name</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data?.map((outbreak) => (
                            <Tr
                                cursor="pointer"
                                onClick={() => onRowSelect(outbreak)}
                                key={outbreak.id}
                            >
                                <Td>{outbreak.id}</Td>
                                <Td>{outbreak.name}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
            {isError && <pre>{JSON.stringify(error, null, 2)}</pre>}
        </Stack>
    );
};

const RemotePrograms = ({ onClose }: { onClose: () => void }) => {
    const queryClient = useQueryClient();
    const programMapping = useStore($programMapping);
    const { isLoading, isError, isSuccess, error, data } = useRemoteGet<
        {
            programs: Array<Partial<IProgram>>;
        },
        {}
    >({
        authentication: {
            ...programMapping.authentication,
            params: {
                "1": { value: "id,name", param: "fields" },
                "2": { value: "false", param: "paging" },
            },
        },
    });
    const onRowSelect = async (program: string) => {
        const queryParams = {
            "1": {
                value: "organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,name,code,programStageDataElements[id,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,valueType,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
                param: "fields",
            },
        };
        const { keys } = makeQueryKeys(queryParams);
        const data = await queryClient.fetchQuery<
            Partial<IProgram> | undefined,
            Error
        >({
            queryKey: ["remote", program, keys],
            queryFn: async () => {
                return fetchRemote<Partial<IProgram>>(
                    {
                        ...programMapping.authentication,
                        params: queryParams,
                    },
                    `api/programs/${program}.json`
                );
            },
        });
        if (data) {
            dhis2ProgramApi.set(data);
            programMappingApi.update({
                attribute: "remoteProgram",
                value: program,
            });
        }
        onClose();
    };
    return (
        <Stack>
            {isLoading && <Spinner />}
            {isSuccess && !isEmpty(data) && (
                <Table colorScheme="facebook">
                    <Thead>
                        <Tr>
                            <Th>Id</Th>
                            <Th>Name</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.programs.map(({ id, name }: any) => (
                            <Tr
                                cursor="pointer"
                                onClick={() => onRowSelect(id)}
                                key={id}
                            >
                                <Td>{id}</Td>
                                <Td>{name}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
            {isError && <pre>{JSON.stringify(error, null, 2)}</pre>}
        </Stack>
    );
};

const AddableValues = ({
    label,
    attribute,
    updateMapping,
    mapping,
    accessor,
}: {
    label: string;
    attribute: "headers" | "params";
    updateMapping: Event<any>;
    mapping: any;
    accessor: string;
}) => {
    return (
        <Stack>
            <Stack direction="row" alignItems="center">
                <Text>{label}</Text>
                <Spacer />
                <IconButton
                    bgColor="none"
                    aria-label="add"
                    icon={<AddIcon w={2} h={2} />}
                    onClick={() =>
                        updateMapping({
                            attribute: `${accessor}.${attribute}.${generateUid()}`,
                            value: {
                                param: "",
                                value: "",
                                forUpdates: false,
                            },
                        })
                    }
                />
            </Stack>

            <Table size="sm">
                <Thead>
                    <Tr>
                        <Th w="35%">Param</Th>
                        <Th w="35%">Value</Th>
                        <Th w="20%" textAlign="center">
                            Update Param?
                        </Th>
                        <Th w="10%"></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Object.entries<
                        Partial<{
                            param: string;
                            value: string;
                            forUpdates: boolean;
                        }>
                    >(getOr({}, `${accessor}.${attribute}`, mapping)).map(
                        ([parameter, { param, value, forUpdates }]) => (
                            <Tr key={parameter}>
                                <Td>
                                    <Input
                                        value={param}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateMapping({
                                                attribute: `${accessor}.${attribute}.${parameter}.param`,
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </Td>
                                <Td>
                                    <Input
                                        value={value}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateMapping({
                                                attribute: `${accessor}.${attribute}.${parameter}.value`,
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </Td>
                                <Td textAlign="center">
                                    <Checkbox isChecked={forUpdates} />
                                </Td>
                                <Td textAlign="right">
                                    <IconButton
                                        aria-label="delete"
                                        bgColor="none"
                                        icon={<DeleteIcon w={3} h={3} />}
                                        onClick={() => {
                                            const {
                                                [parameter]: toRemove,
                                                ...rest
                                            } = getOr(
                                                {},
                                                `${accessor}.${attribute}`,
                                                mapping
                                            );
                                            updateMapping({
                                                attribute: `${accessor}.${attribute}`,
                                                value: rest,
                                            });
                                        }}
                                    />
                                </Td>
                            </Tr>
                        )
                    )}
                </Tbody>
            </Table>
        </Stack>
    );
};

export default function APICredentials({
    updateMapping,
    mapping,
    accessor,
    displayDHIS2Options = false,
}: {
    updateMapping: Event<any>;
    mapping: Partial<IProgramMapping>;
    accessor: string;
    displayDHIS2Options?: boolean;
}) {
    const toast = useToast();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure();
    const [fetching, setFetching] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const metadataAuthApi = useStore($metadataAuthApi);
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) {
            return;
        }
        // 👇️ reset file input
        event.target.value = "";

        // 👇️ is now empty
        console.log(event.target.files);

        // 👇️ can still access file object here
        console.log(fileObj);
        console.log(fileObj.name);
    };

    const onOK = async () => {
        setFetching(() => true);
        try {
            const { data } = await metadataAuthApi.get("");
            if (mapping.responseKey) {
                updateMapping({
                    attribute: "metadataOptions.metadata",
                    value: data[mapping.responseKey],
                });
            } else {
                updateMapping({
                    attribute: "metadataOptions.metadata",
                    value: data,
                });
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
        setFetching(() => false);
        onCloseModal();
    };

    return (
        <Stack spacing="20px">
            <Stack>
                <Text>URL</Text>
                <Input
                    required
                    value={getOr("", `${accessor}.url`, mapping)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: `${accessor}.url`,
                            value: e.target.value,
                        })
                    }
                />
            </Stack>

            <Checkbox
                isChecked={getOr(false, `${accessor}.basicAuth`, mapping)}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateMapping({
                        attribute: `${accessor}.basicAuth`,
                        value: e.target.checked,
                    })
                }
            >
                Basic Authentication
            </Checkbox>
            {getOr(false, `${accessor}.basicAuth`, mapping) && (
                <Stack direction="row" spacing="20px">
                    <Stack w="50%">
                        <Text>Username</Text>
                        <Input
                            value={getOr("", `${accessor}.username`, mapping)}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: `${accessor}.username`,
                                    value: e.target.value,
                                })
                            }
                        />
                    </Stack>
                    <Stack w="50%">
                        <Text>Password</Text>
                        <Input
                            type="password"
                            value={getOr("", `${accessor}.password`, mapping)}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: `${accessor}.password`,
                                    value: e.target.value,
                                })
                            }
                        />
                    </Stack>
                </Stack>
            )}

            <AddableValues
                label="Parameters"
                updateMapping={updateMapping}
                mapping={mapping}
                attribute="params"
                accessor={accessor}
            />
            <AddableValues
                label="Headers"
                updateMapping={updateMapping}
                mapping={mapping}
                attribute="headers"
                accessor={accessor}
            />
            {displayDHIS2Options && (
                <Stack direction="row" spacing="40px">
                    {getOr("", "dataSource", mapping) === "dhis2" && (
                        <Button onClick={onOpen}>Select Program</Button>
                    )}
                    {getOr("", "dataSource", mapping) === "godata" && (
                        <Button onClick={onOpen}>Select Outbreak</Button>
                    )}

                    {!(
                        getOr("", "dataSource", mapping) === "dhis2" ||
                        getOr(false, "isSource", mapping)
                    ) && (
                        <Checkbox
                            isChecked={getOr(false, "prefetch", mapping)}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: "prefetch",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Prefetch Data
                        </Checkbox>
                    )}
                    {getOr(false, "dataSource", mapping) === "api" &&
                        getOr(false, "isSource", mapping) && (
                            <Stack direction="row" spacing="20px">
                                <Button
                                    onClick={() => inputRef.current?.click()}
                                >
                                    Upload Metadata
                                </Button>
                                <Button onClick={() => onOpenModal()}>
                                    Query Metadata from API
                                </Button>

                                <APICredentialsModal
                                    isOpen={isOpenModal}
                                    onClose={onCloseModal}
                                    updateMapping={updateMapping}
                                    onOK={onOK}
                                    mapping={mapping}
                                    accessor="metadataApiAuthentication"
                                    fetching={fetching}
                                    labelField="metadataOptions.labelField"
                                    valueField="metadataOptions.valueField"
                                />

                                <input
                                    style={{ display: "none" }}
                                    ref={inputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </Stack>
                        )}
                    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                Select{" "}
                                {mapping.dataSource === "dhis2"
                                    ? "Program"
                                    : mapping.dataSource === "godata"
                                    ? "Outbreak"
                                    : ""}
                            </ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                {mapping.dataSource === "dhis2" ? (
                                    <RemotePrograms onClose={onClose} />
                                ) : mapping.dataSource === "godata" ? (
                                    <RemoteOutbreaks onClose={onClose} />
                                ) : null}
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </Stack>
            )}
        </Stack>
    );
}
