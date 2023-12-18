import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
    Button,
    Checkbox,
    IconButton,
    Input,
    Spacer,
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
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Tfoot,
} from "@chakra-ui/react";
import { IMapping, IProgramMapping, Option } from "data-import-wizard-utils";
import { Event } from "effector";
import { useStore } from "effector-react";
import { isArray } from "lodash";
import { getOr } from "lodash/fp";
import { ChangeEvent, useRef, useState } from "react";
import { $metadataAuthApi, programMappingApi } from "../pages/program";
import { generateUid } from "../utils/uid";
import { APICredentialsModal } from "./APICredentialsModal";

const AddableValues = <U extends IMapping>({
    label,
    attribute,
    updateMapping,
    mapping,
    accessor,
}: {
    label: string;
    attribute: "headers" | "params";
    updateMapping: Event<{
        attribute: keyof U;
        value: any;
        key?: string;
    }>;
    mapping: Partial<U>;
    accessor: keyof U;
}) => {
    return (
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
                >(getOr({}, `${String(accessor)}.${attribute}`, mapping)).map(
                    ([parameter, { param, value, forUpdates }]) => (
                        <Tr key={parameter}>
                            <Td>
                                <Input
                                    value={param}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        updateMapping({
                                            attribute: accessor,
                                            value: e.target.value,
                                            key: `${attribute}.${parameter}.param`,
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
                                            attribute: accessor,
                                            value: e.target.value,
                                            key: `${attribute}.${parameter}.value`,
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
                                            `${String(accessor)}.${attribute}`,
                                            mapping
                                        );
                                        updateMapping({
                                            attribute: accessor,
                                            value: rest,
                                            key: attribute,
                                        });
                                    }}
                                />
                            </Td>
                        </Tr>
                    )
                )}
            </Tbody>
            <Tfoot>
                <Tr>
                    <Td textAlign="right" colSpan={4}>
                        <IconButton
                            bgColor="none"
                            aria-label="add"
                            icon={<AddIcon w={3} h={3} p="0" m="0" />}
                            size="sm"
                            variant="ghost"
                            _hover={{ bg: "none" }}
                            onClick={() =>
                                updateMapping({
                                    attribute: accessor,
                                    value: {
                                        param: "",
                                        value: "",
                                        forUpdates: false,
                                    },
                                    key: `${attribute}.${generateUid()}`,
                                })
                            }
                        />
                    </Td>
                </Tr>
            </Tfoot>
        </Table>
    );
};

export default function APICredentials<U extends IMapping>({
    updateMapping,
    mapping,
    accessor,
    displayDHIS2Options = false,
}: {
    updateMapping: Event<{
        attribute: keyof U;
        value: any;
        key?: string;
    }>;
    mapping: Partial<U>;
    accessor: keyof U;
    displayDHIS2Options?: boolean;
}) {
    const toast = useToast();

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
                            attribute: "program",
                            value: metadata,
                            key: "metadataOptions.metadata",
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
        // try {
        //     const { data } = await metadataAuthApi.get("");
        //     if (mapping.responseKey) {
        //         updateMapping({
        //             attribute: "metadataOptions.",
        //             value: data[mapping.responseKey],
        //         });
        //     } else {
        //         updateMapping({
        //             attribute: "metadataOptions.metadata",
        //             value: data,
        //         });
        //     }
        // } catch (error: any) {
        //     toast({
        //         title: "Fetch Failed",
        //         description: error?.message,
        //         status: "error",
        //         duration: 9000,
        //         isClosable: true,
        //     });
        // }
        setFetching(() => false);
        onCloseModal();
    };

    return (
        <Stack spacing="20px">
            <Stack>
                <Text>URL</Text>
                <Input
                    required
                    value={getOr("", `${String(accessor)}.url`, mapping)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: accessor,
                            value: e.target.value,
                            key: "url",
                        })
                    }
                />
            </Stack>

            <Checkbox
                isChecked={getOr(
                    false,
                    `${String(accessor)}.basicAuth`,
                    mapping
                )}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    updateMapping({
                        attribute: accessor,
                        value: e.target.checked,
                        key: "basicAuth",
                    })
                }
            >
                Basic Authentication
            </Checkbox>
            {getOr(false, `${String(accessor)}.basicAuth`, mapping) && (
                <Stack direction="row" spacing="20px">
                    <Stack w="50%">
                        <Text>Username</Text>
                        <Input
                            value={getOr(
                                "",
                                `${String(accessor)}.username`,
                                mapping
                            )}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: accessor,
                                    value: e.target.value,
                                    key: "username",
                                })
                            }
                        />
                    </Stack>
                    <Stack w="50%">
                        <Text>Password</Text>
                        <Input
                            type="password"
                            value={getOr(
                                "",
                                `${String(accessor)}.password`,
                                mapping
                            )}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: accessor,
                                    value: e.target.value,
                                    key: "password",
                                })
                            }
                        />
                    </Stack>
                </Stack>
            )}

            <Tabs>
                <TabList>
                    <Tab>Parameters</Tab>
                    <Tab>Headers</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <AddableValues<U>
                            label="Parameters"
                            updateMapping={updateMapping}
                            mapping={mapping}
                            attribute="params"
                            accessor={accessor}
                        />
                    </TabPanel>
                    <TabPanel>
                        <AddableValues<U>
                            label="Headers"
                            updateMapping={updateMapping}
                            mapping={mapping}
                            attribute="headers"
                            accessor={accessor}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {displayDHIS2Options && (
                <Stack direction="row" spacing="40px">
                    {!(
                        getOr("", "dataSource", mapping) === "dhis2-program" ||
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
                                {/* <APICredentialsModal
                                    isOpen={isOpenModal}
                                    onClose={onCloseModal}
                                    updateMapping={updateMapping}
                                    onOK={onOK}
                                    mapping={mapping}
                                    accessor="metadataApiAuthentication"
                                    fetching={fetching}
                                    labelField="metadataOptions.labelField"
                                    valueField="metadataOptions.valueField"
                                /> */}

                                <input
                                    style={{ display: "none" }}
                                    ref={inputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </Stack>
                        )}
                </Stack>
            )}
            {/* <MetadataOptions /> */}
        </Stack>
    );
}
