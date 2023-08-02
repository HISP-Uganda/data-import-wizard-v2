import { usePagination } from "@ajna/pagination";
import {
    Checkbox,
    Icon,
    Input,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Box,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import {
    $attributeMapping,
    $metadata,
    attributeMappingApi,
    $programMapping,
    programMappingApi,
} from "../../pages/program/Store";
import DestinationIcon from "../DestinationIcon";
import OptionSetMapping from "../OptionSetMapping";
import Paginated from "../Paginated";
import SourceIcon from "../SourceIcon";

const Display = ({ data }: { data: Option[] }) => {
    const metadata = useStore($metadata);
    const attributeMapping = useStore($attributeMapping);

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
            pageSize: 5,
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
            attribute: `${attribute}.manual`,
            value: manual,
        });

        if (isSpecific) {
            attributeMappingApi.update({
                attribute: `${attribute}.specific`,
                value: !isSpecific,
            });
        }
    };

    const setSpecific = (attribute: string, specific: boolean) => {
        attributeMappingApi.update({
            attribute: `${attribute}.specific`,
            value: specific,
        });
        const isManual = attributeMapping[attribute]?.manual;

        if (isManual) {
            attributeMappingApi.update({
                attribute: `${attribute}.manual`,
                value: !isManual,
            });
        }
    };
    return (
        <Stack>
            <Table colorScheme="facebook" size="sm">
                <Thead>
                    <Tr>
                        <Th py="10px" w="35%">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon />
                                <Text> Destination</Text>
                            </Stack>
                        </Th>
                        <Th py="10px" w="100px" textAlign="center">
                            Mandatory
                        </Th>
                        <Th py="10px" w="100px" textAlign="center">
                            Unique
                        </Th>
                        <Th py="10px" w="100px" textAlign="center">
                            Custom
                        </Th>
                        <Th py="10px" w="50px" textAlign="center">
                            Specify
                        </Th>
                        <Th py="10px" w="35%">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon />
                                <Text>Source</Text>
                            </Stack>
                        </Th>
                        <Th py="10px" w="70px">
                            Option
                        </Th>
                        <Th py="10px" w="100px">
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
                            }) => (
                                <Tr key={value} _hover={{ bg: "gray.50" }}>
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
                                                    attribute: `${value}.mandatory`,
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
                                                    attribute: `${value}.unique`,
                                                    value: e.target.checked,
                                                });
                                            }}
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                !!getOr(
                                                    false,
                                                    `${value}.manual`,
                                                    attributeMapping
                                                )
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
                                                !!getOr(
                                                    false,
                                                    `${value}.specific`,
                                                    attributeMapping
                                                )
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
                                        {!!getOr(
                                            false,
                                            `${value}.manual`,
                                            attributeMapping
                                        ) ||
                                        !!getOr(
                                            false,
                                            `${value}.specific`,
                                            attributeMapping
                                        ) ? (
                                            <Input
                                                value={String(
                                                    getOr(
                                                        "",
                                                        `${value}.value`,
                                                        attributeMapping
                                                    )
                                                )}
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    attributeMappingApi.update({
                                                        attribute: `${value}.value`,
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
                                                        getOr(
                                                            "",
                                                            `${value}.value`,
                                                            attributeMapping
                                                        )
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
                                                                        !!getOr(
                                                                            false,
                                                                            `${value}.unique`,
                                                                            attributeMapping
                                                                        ) ||
                                                                        unique,
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
                                                destinationOptions={
                                                    availableOptions || []
                                                }
                                                value={value}
                                            />
                                        )}
                                    </Td>
                                    <Td>
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
    const attributeMapping = useStore($attributeMapping);
    const metadata = useStore($metadata);
    const programMapping = useStore($programMapping);
    const entityOptions: Option[] = [
        { label: "Case", value: "CASE" },
        { label: "Contact", value: "CONTACT" },
        { label: "Event", value: "EVENT" },
    ];

    useEffect(() => {
        if (
            programMapping.dataSource === "godata" &&
            !programMapping.responseKey
        ) {
            programMappingApi.update({
                attribute: "responseKey",
                value: "CONTACT",
            });
        }
    }, []);

    useEffect(() => {
        metadata.destinationColumns?.forEach(({ value, mandatory, unique }) => {
            attributeMappingApi.updateMany({
                attribute: value,
                update: { mandatory, unique: unique || false },
            });
        });
        return () => {};
    }, [programMapping.responseKey]);

    if (programMapping.dataSource === "godata") {
        return (
            <Stack>
                <Stack direction="row" alignItems="center">
                    <Text>Entity</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={entityOptions.find(
                                (val) =>
                                    val.value === programMapping.responseKey
                            )}
                            options={entityOptions}
                            isClearable
                            placeholder="Select"
                            onChange={(e) =>
                                programMappingApi.update({
                                    attribute: "responseKey",
                                    value: e?.value,
                                })
                            }
                        />
                    </Box>
                </Stack>

                {programMapping.responseKey === "EVENT" ? (
                    <Display data={metadata.events} />
                ) : (
                    <Tabs>
                        <TabList>
                            <Tab>Personal</Tab>
                            <Tab>Epidemiology</Tab>
                            <Tab>Questionnaire</Tab>
                            {programMapping.responseKey === "CONTACT" && (
                                <Tab>Relationship</Tab>
                            )}
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
                            {programMapping.responseKey === "CONTACT" && (
                                <TabPanel>
                                    <Text>Relationships</Text>
                                </TabPanel>
                            )}
                            <TabPanel>
                                <Text>Lab</Text>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </Stack>
        );
    }

    return <Display data={metadata.destinationColumns} />;
}
