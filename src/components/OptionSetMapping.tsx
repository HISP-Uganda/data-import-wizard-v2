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
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { GroupBase, Select } from "chakra-react-select";
import { Mapping, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import {
    $currentOptions,
    $currentSourceOptions,
    $data,
    $goDataOptions,
    $metadata,
    $optionMapping,
    $mapping,
    $tokens,
} from "../Store";

import {
    currentOptionsApi,
    currentSourceOptionsApi,
    optionMappingApi,
} from "../Events";
import DestinationIcon from "./DestinationIcon";
import SourceIcon from "./SourceIcon";

export default function OptionSetMapping({
    destinationOptions,
    value,
    mapping,
}: {
    destinationOptions: Option[];
    mapping: Mapping;
    value: string;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const currentSourceOptions = useStore($currentSourceOptions);
    const currentOptions = useStore($currentOptions);
    const optionMapping = useStore($optionMapping);
    const data = useStore($data);
    const currentMapping = useStore($mapping);
    const metadata = useStore($metadata);
    const allTokens = useStore($tokens);
    const goDataOptions = useStore($goDataOptions);
    const columns: ColumnsType<Partial<Option>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={mapping} />
                    <Text>Destination Option</Text>
                </Stack>
            ),
            width: "50%",
            render: (_, { label, code, value }) => `${label} (${value})`,
            key: "destination",
        },
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <SourceIcon mapping={mapping} />
                    <Text>Source Option</Text>
                </Stack>
            ),
            width: "50%",
            render: (_, { label, code, value }) => {
                if (currentSourceOptions.length > 0) {
                    return (
                        <Select<Option, true, GroupBase<Option>>
                            value={currentSourceOptions.filter(
                                (val) =>
                                    getOr(
                                        "",
                                        value || code || label || "",
                                        optionMapping
                                    )
                                        .split(",")
                                        .indexOf(val.value ?? "") !== -1
                            )}
                            isMulti
                            options={currentSourceOptions}
                            isClearable
                            onChange={(e) =>
                                optionMappingApi.add({
                                    key: value || "",
                                    value: e
                                        .map((x) => x.value ?? "")
                                        .join(","),
                                })
                            }
                        />
                    );
                } else {
                    return (
                        <Input
                            value={optionMapping[code || ""]}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                optionMappingApi.add({
                                    key: code || "",
                                    value: e.target.value,
                                })
                            }
                        />
                    );
                }
            },
            key: "source",
        },
    ];

    const openOptionSetDialog = (id: string, destinationOptions?: Option[]) => {
        if (
            ["xlsx-line-list", "json", "csv-line-list"].indexOf(
                currentMapping.dataSource ?? ""
            ) !== -1
        ) {
            currentSourceOptionsApi.set(
                data.flatMap((d) => {
                    const value: string = getOr("", id, d);
                    if (value) {
                        const opt: Option = {
                            value,
                            label: value,
                        };
                        return opt;
                    }
                    return [];
                })
            );
        } else if (id) {
            currentSourceOptionsApi.set(
                metadata.sourceColumns.find(({ value }) => value === id)
                    ?.availableOptions ?? []
            );
        } else if (currentMapping.dataSource === "go-data") {
            currentSourceOptionsApi.set(
                goDataOptions.map(({ id }) => {
                    return { label: allTokens[id] || id, value: id };
                })
            );
        } else if (currentMapping.dataSource === "dhis2-program") {
            currentSourceOptionsApi.set(
                metadata.sourceColumns.find((curr) => value === curr.value)
                    ?.availableOptions ?? []
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
                        String(getOr("", "value", getOr({}, value, mapping))),
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
