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
    fetchRemote,
    getLowestLevelParents,
    GODataOption,
    GODataTokenGenerationResponse,
    IGoData,
    IGoDataOrgUnit,
    IProgram,
    IProgramMapping,
    Option,
} from "data-import-wizard-utils";
import { Event } from "effector";
import { useStore } from "effector-react";
import { fromPairs, isArray } from "lodash";
import { getOr, isEmpty } from "lodash/fp";
import { ChangeEvent, useRef, useState } from "react";
import {
    $metadataAuthApi,
    $programMapping,
    $token,
    currentSourceOptionsApi,
    dhis2ProgramApi,
    goDataApi,
    goDataOptionsApi,
    programMappingApi,
    remoteOrganisationsApi,
    tokensApi,
} from "../pages/program/Store";
import { makeQueryKeys, useRemoteGet } from "../Queries";
import { generateUid } from "../utils/uid";
import { APICredentialsModal } from "./APICredentialsModal";
import MetadataOptions from "./MetadataOptions";

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
                    icon={<AddIcon w={3} h={3} />}
                    size="sm"
                    variant="ghost"
                    _hover={{ bg: "none" }}
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
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            let fileReader = new FileReader();
            const file = e.target.files[0];
            fileReader.onload = async (e) => {
                const result = e.target?.result;
                if (result) {
                    const metadata: Option = JSON.parse(String(result));
                    if (isArray(metadata)) {
                        programMappingApi.update({
                            attribute: "metadataOptions.metadata",
                            value: metadata,
                        });
                    }
                }
            };
            fileReader;
            fileReader.readAsText(file);
        }
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
                    {/* {getOr("", "dataSource", mapping) === "dhis2" && (
                        <Button onClick={onOpen}>Select Program</Button>
                    )}
                    {getOr("", "dataSource", mapping) === "godata" && (
                        <Button onClick={onOpen}>Select Outbreak</Button>
                    )} */}

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
                    {/* <Modal isOpen={isOpen} onClose={onClose} size="2xl">
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
                            <ModalBody
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                {mapping.dataSource === "dhis2" ? (
                                    <RemotePrograms onClose={onClose} />
                                ) : mapping.dataSource === "godata" ? (
                                    <RemoteOutbreaks onClose={onClose} />
                                ) : null}
                            </ModalBody>
                        </ModalContent>
                    </Modal> */}
                </Stack>
            )}
            {/* <MetadataOptions /> */}
        </Stack>
    );
}
