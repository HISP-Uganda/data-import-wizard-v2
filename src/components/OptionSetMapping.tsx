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
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure,
    Text,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
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

    const openOptionSetDialog = (id: string, destinationOptions?: Option[]) => {
        const sourceOptions =
            metadata.sourceColumns.find(({ value }) => value === id)
                ?.availableOptions || [];
        if (
            (programMapping.prefetch &&
                programMapping.dataSource !== "go-data" &&
                !programMapping.isSource) ||
            ["xlsx-line-list", "json", "csv-line-list"].indexOf(
                programMapping.dataSource || ""
            ) !== -1
        ) {
            if (sourceOptions && sourceOptions.length > 0) {
                currentSourceOptionsApi.set(sourceOptions);
            } else {
                const allOptions = data.flatMap((d) => {
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
                currentSourceOptionsApi.set(allOptions);
            }
        } else if (programMapping.isSource) {
            currentSourceOptionsApi.set(sourceOptions);
        }
        // else if (
        //     programMapping.dataSource === "godata" &&
        //     !programMapping.isSource &&
        //     sourceOptions.length > 0
        // ) {
        //     currentSourceOptionsApi.set(sourceOptions);
        // } else if (
        //     programMapping.dataSource === "godata" &&
        //     !programMapping.isSource
        // ) {
        // }
        currentOptionsApi.set(destinationOptions || []);
        onOpen();
    };

    return (
        <Stack>
            <Button
                onClick={() =>
                    openOptionSetDialog(
                        String(getOr("", `${value}.value`, attributeMapping)),
                        destinationOptions
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
                                    <Th py="20px">
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                        >
                                            <DestinationIcon
                                                mapping={programMapping}
                                            />
                                            <Text>Destination Option</Text>
                                        </Stack>
                                    </Th>
                                    <Th textAlign="center" py="20px">
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                        >
                                            <SourceIcon
                                                mapping={programMapping}
                                            />
                                            <Text>Source Option</Text>
                                        </Stack>
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {currentOptions.map(
                                    ({ value, code, label }) => (
                                        <Tr key={value}>
                                            <Td w="400px">{`${label} (${value})`}</Td>
                                            <Td textAlign="center">
                                                {currentSourceOptions.length >
                                                0 ? (
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
                                                            optionMappingApi.add(
                                                                {
                                                                    key:
                                                                        value ||
                                                                        "",
                                                                    value:
                                                                        e?.value ||
                                                                        "",
                                                                }
                                                            )
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
                                                            optionMappingApi.add(
                                                                {
                                                                    key:
                                                                        code ||
                                                                        "",
                                                                    value: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                    />
                                                )}
                                            </Td>
                                        </Tr>
                                    )
                                )}
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
