import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    useDisclosure,
    Text,
} from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { GroupBase, Select } from "chakra-react-select";
import { Option, RealMapping } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import {
    $attributeMapping,
    $currentOptions,
    $currentSourceOptions,
    $data,
    $goDataOptions,
    $metadata,
    $optionMapping,
    $programMapping,
    $tokens,
    currentOptionsApi,
    currentSourceOptionsApi,
    optionMappingApi,
} from "../pages/program";
import DestinationIcon from "./DestinationIcon";
import SourceIcon from "./SourceIcon";

export default function OptionSetMapping({
    destinationOptions,
    value,
}: {
    destinationOptions: Option[];
    value: string;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const currentSourceOptions = useStore($currentSourceOptions);
    const currentOptions = useStore($currentOptions);
    const optionMapping = useStore($optionMapping);
    const data = useStore($data);
    const programMapping = useStore($programMapping);
    const attributeMapping = useStore($attributeMapping);
    const metadata = useStore($metadata);
    const allTokens = useStore($tokens);
    const goDataOptions = useStore($goDataOptions);
    const columns: ColumnsType<Partial<Option>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={programMapping} />
                    <Text>Destination Option</Text>
                </Stack>
            ),
            width: "50%",
            render: (_, { label, code, value }) => `${label} (${value})`,
            key: "label",
        },
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <SourceIcon mapping={programMapping} />
                    <Text>Source Option</Text>
                </Stack>
            ),
            width: "50%",
            render: (_, { label, code, value }) => {
                if (currentSourceOptions.length > 0) {
                    return (
                        <Select<Option, false, GroupBase<Option>>
                            value={currentSourceOptions.find(
                                (val) =>
                                    val.value ===
                                    getOr(
                                        "",
                                        value || code || label || "",
                                        optionMapping
                                    )
                            )}
                            options={currentSourceOptions}
                            isClearable
                            onChange={(e) =>
                                optionMappingApi.add({
                                    key: value || "",
                                    value: e?.value || "",
                                })
                            }
                        />
                    );
                } else {
                    <Input
                        value={optionMapping[code || ""]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            optionMappingApi.add({
                                key: code || "",
                                value: e.target.value,
                            })
                        }
                    />;
                }
            },
            key: "label",
        },
    ];

    const openOptionSetDialog = (id: string, destinationOptions?: Option[]) => {
        if (
            ["xlsx-line-list", "json", "csv-line-list"].indexOf(
                programMapping.dataSource || ""
            ) !== -1
        ) {
            const sourceOptions = data.flatMap((d) => {
                const value: string = getOr("", id, d);
                if (value) {
                    const opt: Option = {
                        value,
                        label: value,
                    };
                    return opt;
                }
                return [];
            });
            currentSourceOptionsApi.set(sourceOptions);
        } else if (id) {
            const filteredOptions =
                metadata.sourceColumns.find(({ value }) => value === id)
                    ?.availableOptions ?? [];
            if (filteredOptions.length > 0) {
                currentSourceOptionsApi.set(filteredOptions);
            }
        } else if (programMapping.dataSource === "go-data") {
            currentSourceOptionsApi.set(
                goDataOptions.map(({ id }) => {
                    return { label: allTokens[id] || id, value: id };
                })
            );
        }
        currentOptionsApi.set(destinationOptions || []);
        onOpen();
    };

    return (
        <Stack>
            <Button
                onClick={() => {
                    openOptionSetDialog(
                        String(
                            getOr(
                                "",
                                "value",
                                getOr({}, value, attributeMapping)
                            )
                        ),
                        destinationOptions
                    );
                }}
            >
                Map Options
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} size="6xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Option Set Mapping</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table
                            columns={columns}
                            dataSource={currentOptions}
                            rowKey="value"
                            pagination={{ pageSize: 7 }}
                            size="small"
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Stack>
    );
}
