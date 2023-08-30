import { usePagination } from "@ajna/pagination";
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
import { Option } from "data-import-wizard-utils";
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
    $names,
    $optionMapping,
    $programMapping,
    attributeMappingApi,
    optionMappingApi,
    programMappingApi,
} from "../../pages/program/Store";
import DestinationIcon from "../DestinationIcon";
import OptionSetMapping from "../OptionSetMapping";
import Paginated from "../Paginated";
import Search from "../Search";
import SourceIcon from "../SourceIcon";

const Step4 = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const attributeMapping = useStore($attributeMapping);
    const programMapping = useStore($programMapping);
    const metadata = useStore($metadata);
    const currentOptions = useStore($currentOptions);
    const optionMapping = useStore($optionMapping);
    const currentSourceOptions = useStore($currentSourceOptions);
    const { source, destination } = useStore($names);

    const [currentAttributes, setCurrentAttributes] = useState(
        metadata.destinationAttributes
    );

    const [searchString, setSearchString] = useState<string>("");

    const outerLimit = 4;
    const innerLimit = 4;

    // pagination hook
    const {
        pages,
        pagesCount,
        currentPage,
        setCurrentPage,

        pageSize,
        setPageSize,
    } = usePagination({
        total: currentAttributes.length,
        limits: {
            outer: outerLimit,
            inner: innerLimit,
        },
        initialState: {
            pageSize: 7,
            currentPage: 1,
        },
    });

    const updateAttribute = (
        attributes: { attribute: string; value: any }[]
    ) => {
        for (const { attribute, value } of attributes) {
            attributeMappingApi.update({
                attribute,
                key: "value",
                value,
            });
        }
    };

    useEffect(() => {
        for (const {
            value: destinationValue,
        } of metadata.destinationAttributes) {
            if (!attributeMapping[destinationValue]) {
                const search = metadata.sourceAttributes.find(
                    ({ value }) => value === destinationValue
                );
                if (search) {
                    attributeMappingApi.update({
                        attribute: `${destinationValue}`,
                        key: "value",
                        value: search.value,
                    });
                }
            }
        }
    }, []);

    const handlePageChange = (nextPage: number): void => {
        setCurrentPage(nextPage);
    };

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const pageSize = Number(event.target.value);
        setPageSize(pageSize);
    };

    const setCustom = (attribute: string, manual: boolean) => {
        const isSpecific = attributeMapping[attribute]?.specific;
        attributeMappingApi.update({
            attribute,
            key: "manual",
            value: manual,
        });

        if (isSpecific) {
            attributeMappingApi.update({
                attribute,
                key: "specific",
                value: !isSpecific,
            });
        }
    };

    const setSpecific = (attribute: string, specific: boolean) => {
        attributeMappingApi.update({
            attribute,
            key: "specific",
            value: specific,
        });
        const isManual = attributeMapping[attribute]?.manual;

        if (isManual) {
            attributeMappingApi.update({
                attribute,
                key: "manual",
                value: !isManual,
            });
        }
    };

    return (
        <Stack>
            <Stack spacing="20px" direction="row" alignItems="center">
                <Text>Tracked Entity Column</Text>
                <Stack spacing="0">
                    <Checkbox
                        isChecked={
                            programMapping.trackedEntityInstanceColumnIsManual
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            programMappingApi.update({
                                attribute: `trackedEntityInstanceColumnIsManual`,
                                value: e.target.checked,
                            })
                        }
                    >
                        Custom Tracked Entity Column
                    </Checkbox>
                    <Box w="500px">
                        {programMapping.trackedEntityInstanceColumnIsManual ? (
                            <Input
                                value={
                                    programMapping.trackedEntityInstanceColumn
                                }
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    programMappingApi.update({
                                        attribute:
                                            "trackedEntityInstanceColumn",
                                        value: e.target.value,
                                    })
                                }
                            />
                        ) : (
                            <Select<Option, false, GroupBase<Option>>
                                value={metadata.sourceColumns.find(
                                    (val) =>
                                        val.value ===
                                        programMapping.trackedEntityInstanceColumn
                                )}
                                options={metadata.sourceColumns}
                                isClearable
                                placeholder="Select tracked entity column"
                                onChange={(e) =>
                                    programMappingApi.update({
                                        attribute:
                                            "trackedEntityInstanceColumn",
                                        value: e?.value || "",
                                    })
                                }
                            />
                        )}
                    </Box>
                </Stack>
            </Stack>

            <Search
                options={metadata.destinationAttributes}
                mapping={attributeMapping}
                searchString={searchString}
                setSearchString={setSearchString}
                action={setCurrentAttributes}
                setCurrentPage={setCurrentPage}
                placeholder="Search attributes"
                label="Show Mapped Attributes Only"
            />
            <Table size="sm">
                <Thead>
                    <Tr>
                        <Th py="20px" textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon />
                                <Text> Destination Attribute</Text>
                                <Text>{destination}</Text>
                            </Stack>
                        </Th>
                        <Th
                            textAlign="center"
                            py="20px"
                            w="100px"
                            textTransform="none"
                        >
                            Mandatory
                        </Th>
                        <Th
                            textAlign="center"
                            py="20px"
                            w="100px"
                            textTransform="none"
                        >
                            Unique
                        </Th>
                        <Th
                            textAlign="center"
                            py="20px"
                            w="150px"
                            textTransform="none"
                        >
                            Custom
                        </Th>
                        <Th
                            py="10px"
                            w="50px"
                            textAlign="center"
                            textTransform="none"
                        >
                            Specify
                        </Th>
                        <Th py="20px" textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon />
                                <Text>Source Attribute</Text>
                                <Text>{source}</Text>
                            </Stack>
                        </Th>
                        <Th w="200px" textTransform="none">
                            Options
                        </Th>
                        <Th w="75px" py="20px" textTransform="none">
                            Mapped?
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {currentAttributes
                        .slice(
                            currentPage * pageSize - pageSize,
                            pageSize * currentPage
                        )
                        .map(
                            ({
                                value,
                                label,
                                unique,
                                optionSetValue,
                                code,
                                mandatory,
                                availableOptions,
                                valueType,
                            }) => (
                                <Tr
                                    key={value}
                                    borderColor="green.100"
                                    _hover={{ bg: "gray.50" }}
                                >
                                    <Td>{label}</Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value]
                                                    ?.mandatory
                                            }
                                            isReadOnly={mandatory}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                attributeMappingApi.update({
                                                    attribute: value,
                                                    key: "mandatory",
                                                    value: e.target.checked,
                                                })
                                            }
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value]?.unique
                                            }
                                            isReadOnly={unique}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) => {
                                                attributeMappingApi.update({
                                                    attribute: value,
                                                    key: "unique",
                                                    value: e.target.checked,
                                                });
                                            }}
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value]?.manual
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setCustom(
                                                    value,
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value]
                                                    ?.specific
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setSpecific(
                                                    value,
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </Td>
                                    <Td>
                                        {attributeMapping[value]?.manual ||
                                        attributeMapping[value]?.specific ? (
                                            <Input
                                                value={
                                                    attributeMapping[value]
                                                        ?.value
                                                }
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    attributeMappingApi.update({
                                                        attribute: `${value}`,
                                                        key: "value",
                                                        value: e.target.value,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <Select<
                                                Option,
                                                false,
                                                GroupBase<Option>
                                            >
                                                value={metadata.sourceColumns?.find(
                                                    (val) =>
                                                        val.value ===
                                                        attributeMapping[value]
                                                            ?.value
                                                )}
                                                options={metadata.sourceColumns?.map(
                                                    ({ value, label }) => ({
                                                        label,
                                                        value,
                                                    })
                                                )}
                                                isClearable
                                                onChange={(e) =>
                                                    attributeMappingApi.updateMany(
                                                        attributeMappingApi.updateMany(
                                                            {
                                                                attribute:
                                                                    value,
                                                                update: {
                                                                    value:
                                                                        e?.value ||
                                                                        "",
                                                                    unique:
                                                                        attributeMapping[
                                                                            value
                                                                        ]
                                                                            ?.unique ||
                                                                        unique,
                                                                    valueType,
                                                                },
                                                            }
                                                        )
                                                    )
                                                }
                                            />
                                        )}
                                    </Td>
                                    <Td>
                                        {optionSetValue && (
                                            <OptionSetMapping
                                                value={value}
                                                destinationOptions={
                                                    availableOptions || []
                                                }
                                            />
                                        )}
                                    </Td>
                                    <Td textAlign="center">
                                        {attributeMapping[value]?.value && (
                                            <Icon
                                                as={FiCheck}
                                                color="green.400"
                                                fontSize="2xl"
                                            />
                                        )}
                                    </Td>
                                </Tr>
                            )
                        )}
                </Tbody>

                <Tfoot>
                    <Tr>
                        <Td colSpan={8} textAlign="right">
                            Mapped{" "}
                            {
                                Object.values(attributeMapping).filter(
                                    ({ value }) => !!value
                                ).length
                            }{" "}
                            of {metadata.destinationAttributes.length}
                        </Td>
                    </Tr>
                </Tfoot>
            </Table>
            <Paginated
                pages={pages}
                pagesCount={pagesCount}
                currentPage={currentPage}
                handlePageSizeChange={handlePageSizeChange}
                handlePageChange={handlePageChange}
                pageSize={pageSize}
            />
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior="inside"
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
                                {currentOptions.map(({ label, code }) => (
                                    <Tr key={code}>
                                        <Td w="400px">{label}</Td>
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
                                                            key: code || "",
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
};

export default Step4;
