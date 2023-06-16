import React from "react";
import {
    Box,
    Button,
    Checkbox,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { CommonIdentifier, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { FiCheck } from "react-icons/fi";
import { ChangeEvent, useEffect, useState } from "react";
import {
    $attributeMapping,
    $currentOptions,
    $currentSourceOptions,
    $data,
    $metadata,
    $optionMapping,
    $programMapping,
    currentOptionsApi,
    currentSourceOptionsApi,
    optionMappingApi,
} from "../pages/program/Store";

export default function OptionSetMapping({
    options,
    value,
}: {
    options: Option[];
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

    const openOptionSetDialog = (id: string, options?: Option[]) => {
        if (
            (programMapping.prefetch &&
                programMapping.dataSource !== "godata" &&
                !programMapping.isSource) ||
            ["xlsx", "json", "csv"].indexOf(programMapping.dataSource || "") !==
                -1
        ) {
            const allOptions = data.flatMap((d) => {
                const value: string = getOr("", id, d);
                if (value) {
                    const opt: Option = { value, label: value };
                    return opt;
                }
                return [];
            });
            currentSourceOptionsApi.set(allOptions);
        } else if (programMapping.isSource) {
            const options =
                metadata.sourceColumns.find(({ value }) => value === id)
                    ?.options || [];
            console.log(metadata.sourceColumns);
            currentSourceOptionsApi.set(options);
        }
        currentOptionsApi.set(options || []);
        onOpen();
    };

    return (
        <Stack>
            <Button
                onClick={() =>
                    openOptionSetDialog(
                        String(getOr("", `${value}.value`, attributeMapping)),
                        options
                    )
                }
            >
                Map Options
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                // scrollBehavior="inside"
                size="6xl"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Option Set Mapping</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th py="20px">Destination Option</Th>
                                    <Th textAlign="center" py="20px">
                                        Source Option
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {currentOptions.map(({ value, code }) => (
                                    <Tr key={value}>
                                        <Td w="400px">{value}</Td>
                                        <Td textAlign="center">
                                            {currentSourceOptions.length > 0 ? (
                                                <Select<
                                                    Option,
                                                    false,
                                                    GroupBase<Option>
                                                >
                                                    value={currentSourceOptions.find(
                                                        (val) =>
                                                            val.value ===
                                                            getOr(
                                                                "",
                                                                code || "",
                                                                optionMapping
                                                            )
                                                    )}
                                                    options={
                                                        currentSourceOptions
                                                    }
                                                    isClearable
                                                    onChange={(e) =>
                                                        optionMappingApi.add({
                                                            key: value || "",
                                                            value:
                                                                e?.value || "",
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <Input
                                                    value={
                                                        optionMapping[
                                                            code || ""
                                                        ]
                                                    }
                                                    onChange={(
                                                        e: ChangeEvent<HTMLInputElement>
                                                    ) =>
                                                        optionMappingApi.add({
                                                            key: code || "",
                                                            value: e.target
                                                                .value,
                                                        })
                                                    }
                                                />
                                            )}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
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
