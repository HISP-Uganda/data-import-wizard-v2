import { usePagination } from "@ajna/pagination";
import {
    Box,
    Checkbox,
    Icon,
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
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import {
    $attributeMapping,
    $metadata,
    $names,
    $programMapping,
    attributeMappingApi,
    programMappingApi,
} from "../../pages/program";
import DestinationIcon from "../DestinationIcon";
import OptionSetMapping from "../OptionSetMapping";
import Paginated from "../Paginated";
import Progress from "../Progress";
import SourceIcon from "../SourceIcon";

const Display = ({ data }: { data: Option[] }) => {
    const metadata = useStore($metadata);
    const attributeMapping = useStore($attributeMapping);
    const { source, destination } = useStore($names);
    const programMapping = useStore($programMapping);

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
        total: data.length,
        limits: {
            outer: outerLimit,
            inner: innerLimit,
        },
        initialState: {
            pageSize: 7,
            currentPage: 1,
        },
    });
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
            <Table colorScheme="facebook" size="sm">
                <Thead>
                    <Tr>
                        <Th py="10px" w="35%" textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon mapping={programMapping} />
                                <Text> Destination</Text>
                                <Text>{destination}</Text>
                            </Stack>
                        </Th>
                        <Th
                            py="10px"
                            w="100px"
                            textAlign="center"
                            textTransform="none"
                        >
                            Mandatory
                        </Th>
                        <Th
                            py="10px"
                            w="100px"
                            textAlign="center"
                            textTransform="none"
                        >
                            Unique
                        </Th>
                        <Th
                            py="10px"
                            w="100px"
                            textAlign="center"
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
                        <Th py="10px" w="35%" textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon mapping={programMapping} />
                                <Text>Source</Text>
                                <Text>{source}</Text>
                            </Stack>
                        </Th>
                        <Th py="10px" w="70px" textTransform="none">
                            Option
                        </Th>
                        <Th py="10px" w="100px" textTransform="none">
                            Mapped?
                        </Th>
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
                                value,
                                label,
                                unique,
                                mandatory,
                                availableOptions,
                                optionSetValue,
                                valueType,
                            }) => (
                                <Tr key={value} _hover={{ bg: "gray.50" }}>
                                    <Td>{label}</Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value ?? ""]
                                                    ?.mandatory || mandatory
                                            }
                                            isReadOnly={mandatory}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                attributeMappingApi.update({
                                                    attribute: value ?? "",
                                                    key: "mandatory",
                                                    value: e.target.checked,
                                                })
                                            }
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value ?? ""]
                                                    ?.unique || unique
                                            }
                                            isReadOnly={unique}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) => {
                                                attributeMappingApi.update({
                                                    attribute: value ?? "",
                                                    key: "unique",
                                                    value: e.target.checked,
                                                });
                                            }}
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value ?? ""]
                                                    ?.manual
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setCustom(
                                                    value ?? "",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                attributeMapping[value ?? ""]
                                                    ?.specific
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                setSpecific(
                                                    value ?? "",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    </Td>
                                    <Td>
                                        {attributeMapping[value ?? ""]
                                            ?.manual ||
                                        attributeMapping[value ?? ""]
                                            ?.specific ? (
                                            <Input
                                                value={
                                                    attributeMapping[
                                                        value ?? ""
                                                    ]?.value
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
                                                value={metadata.sourceColumns.find(
                                                    (val) => {
                                                        if (value) {
                                                            return (
                                                                attributeMapping[
                                                                    value
                                                                ] !==
                                                                    undefined &&
                                                                attributeMapping[
                                                                    value
                                                                ].value ===
                                                                    val.value
                                                            );
                                                        }
                                                        return false;
                                                    }
                                                )}
                                                options={metadata.sourceColumns}
                                                isClearable
                                                onChange={(e) =>
                                                    attributeMappingApi.updateMany(
                                                        attributeMappingApi.updateMany(
                                                            {
                                                                attribute:
                                                                    value ?? "",
                                                                update: {
                                                                    value:
                                                                        e?.value ||
                                                                        "",
                                                                    unique:
                                                                        attributeMapping[
                                                                            value ??
                                                                                ""
                                                                        ]
                                                                            ?.unique ||
                                                                        unique,
                                                                    valueType,
                                                                },
                                                            }
                                                        )
                                                    )
                                                }
                                                formatGroupLabel={(group) => (
                                                    <Text
                                                        color="red.500"
                                                        ml="-10px"
                                                        fontSize="20px"
                                                    >
                                                        {group.label}
                                                    </Text>
                                                )}
                                                formatOptionLabel={(option) => (
                                                    <Text cursor="pointer">
                                                        {option.label}
                                                    </Text>
                                                )}
                                            />
                                        )}
                                    </Td>
                                    <Td>
                                        {optionSetValue && (
                                            <OptionSetMapping
                                                destinationOptions={
                                                    availableOptions || []
                                                }
                                                value={value ?? ""}
                                            />
                                        )}
                                    </Td>
                                    <Td>
                                        {attributeMapping[value ?? ""]
                                            ?.value && (
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
                            <Stack
                                direction="row"
                                spacing="20px"
                                alignItems="center"
                                justifyContent="flex-end"
                            >
                                <Text>
                                    Mapped
                                    {
                                        Object.values(attributeMapping).filter(
                                            ({ value }) => !!value
                                        ).length
                                    }{" "}
                                    of {data.length}
                                </Text>
                            </Stack>
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
        </Stack>
    );
};

export function OtherSystemMapping() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const metadata = useStore($metadata);
    const programMapping = useStore($programMapping);
    const entityOptions: Option[] = [
        { label: "Case", value: "CASE" },
        { label: "Contact", value: "CONTACT" },
        { label: "Event", value: "EVENT" },
    ];

    useEffect(() => {
        if (
            programMapping.dataSource === "go-data" &&
            !programMapping.program?.responseKey
        ) {
            programMappingApi.update({
                attribute: "program",
                key: "responseKey",
                value: "CASE",
            });
        }
    }, []);

    useEffect(() => {
        onOpen();
        for (const {
            value,
            mandatory,
            unique,
        } of metadata.destinationColumns) {
            // attributeMappingApi.updateMany({
            //     attribute: value,
            //     update: { mandatory, unique: unique || false },
            // });
        }
        onClose();
        return () => {};
    }, [programMapping.program?.responseKey]);

    if (programMapping.dataSource === "go-data") {
        return (
            <Stack>
                <Stack direction="row" alignItems="center">
                    <Text>Entity</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={entityOptions.find(
                                (val) =>
                                    val.value ===
                                    programMapping.program?.responseKey
                            )}
                            options={entityOptions}
                            isClearable
                            placeholder="Select"
                            onChange={(e) =>
                                programMappingApi.update({
                                    attribute: "program",
                                    key: "responseKey",
                                    value: e?.value,
                                })
                            }
                        />
                    </Box>
                </Stack>

                {programMapping.program?.responseKey === "EVENT" ? (
                    <Display data={metadata.events} />
                ) : (
                    <Tabs>
                        <TabList>
                            <Tab>Personal</Tab>
                            <Tab>Epidemiology</Tab>
                            <Tab>Questionnaire</Tab>
                            {programMapping.program?.responseKey ===
                                "CONTACT" && <Tab>Relationship</Tab>}
                            <Tab>Lab</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <Display data={metadata.personal} />
                            </TabPanel>
                            <TabPanel>
                                <Display data={metadata.epidemiology} />
                            </TabPanel>
                            <TabPanel>
                                <Display data={metadata.questionnaire} />
                            </TabPanel>
                            {programMapping.program?.responseKey ===
                                "CONTACT" && (
                                <TabPanel>
                                    <Display data={metadata.relationship} />
                                </TabPanel>
                            )}
                            <TabPanel>
                                <Display data={metadata.lab} />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </Stack>
        );
    }

    return (
        <Stack>
            <Display data={metadata.destinationColumns} />
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Creating initial mapping and trying to map automatically"
                onOpen={onOpen}
            />
        </Stack>
    );
}
