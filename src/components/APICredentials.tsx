import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
    Button,
    Checkbox,
    IconButton,
    Input,
    Stack,
    Tab,
    Table,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { Authentication, IMapping, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { isArray } from "lodash";
import { getOr } from "lodash/fp";
import { ChangeEvent, useRef, useState } from "react";
import { mappingApi } from "../Events";
import { $mapping, $metadataAuthApi } from "../Store";

const AddableValues = ({
    accessor,
    attribute,
}: {
    accessor: keyof IMapping;
    attribute: "headers" | "params";
}) => {
    const mapping = useStore($mapping);
    const authentication: Partial<Authentication> =
        (mapping[accessor] as Partial<Authentication>) ?? {};
    const vals = authentication[attribute] ?? {};
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
                {Object.entries(vals).map(
                    ([parameter, { param, value, forUpdates }]) => (
                        <Tr key={parameter}>
                            <Td>
                                <Input
                                    value={param}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        mappingApi.update({
                                            attribute: accessor,
                                            value: e.target.value,
                                            path: attribute,
                                            subPath: "param",
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
                                        mappingApi.update({
                                            attribute: accessor,
                                            value: e.target.value,
                                            path: attribute,
                                            subPath: "value",
                                        })
                                    }
                                />
                            </Td>
                            <Td textAlign="center">
                                <Checkbox
                                    isChecked={forUpdates}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        mappingApi.update({
                                            attribute: accessor,
                                            value: e.target.value,
                                            path: attribute,
                                            subPath: "forUpdates",
                                        })
                                    }
                                />
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
                                        mappingApi.update({
                                            attribute: accessor,
                                            value: rest,
                                            path: attribute,
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
                                mappingApi.update({
                                    attribute: accessor,
                                    value: {
                                        param: "",
                                        value: "",
                                        forUpdates: false,
                                    },
                                    path: attribute,
                                })
                            }
                        />
                    </Td>
                </Tr>
            </Tfoot>
        </Table>
    );
};

export default function APICredentials({
    displayDHIS2Options = false,
    accessor,
}: {
    displayDHIS2Options?: boolean;
    accessor: keyof IMapping;
}) {
    const mapping = useStore($mapping);
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
                        mappingApi.update({
                            attribute: "program",
                            value: metadata,
                            path: "metadataOptions",
                            subPath: "metadata",
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
                    value={mapping.authentication?.url ?? ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        mappingApi.update({
                            attribute: "authentication",
                            value: e.target.value,
                            path: "url",
                        })
                    }
                />
            </Stack>

            <Checkbox
                isChecked={mapping.authentication?.basicAuth}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    mappingApi.update({
                        attribute: "authentication",
                        value: e.target.checked,
                        path: "basicAuth",
                    })
                }
            >
                Basic Authentication
            </Checkbox>
            {mapping.authentication?.basicAuth && (
                <Stack direction="row" spacing="20px">
                    <Stack w="50%">
                        <Text>Username</Text>
                        <Input
                            value={mapping.authentication?.username ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: "authentication",
                                    value: e.target.value,
                                    path: "username",
                                })
                            }
                        />
                    </Stack>
                    <Stack w="50%">
                        <Text>Password</Text>
                        <Input
                            type="password"
                            value={mapping.authentication?.password ?? ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: "authentication",
                                    value: e.target.value,
                                    path: "password",
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
                        <AddableValues attribute="params" accessor={accessor} />
                    </TabPanel>
                    <TabPanel>
                        <AddableValues
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
                                mappingApi.update({
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
