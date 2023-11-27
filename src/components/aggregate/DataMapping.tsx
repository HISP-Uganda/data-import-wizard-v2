import { usePagination } from "@ajna/pagination";
import {
    Icon,
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
import { FiCheck } from "react-icons/fi";

import { ChangeEvent, useEffect, useState } from "react";
import { $aggMetadata, $aggregateMapping } from "../../pages/aggregate";
import {
    $attributeMapping,
    $currentOptions,
    $currentSourceOptions,
    $names,
    $optionMapping,
    attributeMappingApi,
} from "../../pages/program";
import DestinationIcon from "../DestinationIcon";
import Paginated from "../Paginated";
import Search from "../Search";
import SourceIcon from "../SourceIcon";

const DataMapping = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const attributeMapping = useStore($attributeMapping);
    const aggregateMapping = useStore($aggregateMapping);
    const aggregateMetadata = useStore($aggMetadata);
    const currentOptions = useStore($currentOptions);
    const optionMapping = useStore($optionMapping);
    const currentSourceOptions = useStore($currentSourceOptions);
    const { source, destination } = useStore($names);

    const [currentAttributes, setCurrentAttributes] = useState(
        aggregateMetadata.destinationColumns
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

    useEffect(() => {
        for (const {
            value: destinationValue,
            unique,
            label: destinationLabel,
            mandatory,
        } of aggregateMetadata.destinationColumns) {
            if (attributeMapping[destinationValue ?? ""] === undefined) {
                const search = aggregateMetadata.sourceColumns.find(
                    ({ value }) => value === destinationValue
                );
                if (search) {
                    attributeMappingApi.updateMany({
                        attribute: `${destinationValue}`,
                        update: {
                            value: search.value,
                            unique,
                            mandatory,
                        },
                    });
                } else {
                    const search2 = aggregateMetadata.sourceColumns.find(
                        ({ label }) => label === destinationLabel
                    );
                    if (search2) {
                        attributeMappingApi.updateMany({
                            attribute: `${destinationValue}`,
                            update: {
                                value: search2.value,
                                unique,
                                mandatory,
                            },
                        });
                    }
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
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            <Search
                options={aggregateMetadata.destinationColumns}
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
                        <Th textTransform="none" w="50%">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon mapping={aggregateMapping} />
                                <Text> Destination Attribute</Text>
                                <Text>{destination}</Text>
                            </Stack>
                        </Th>

                        <Th textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon mapping={aggregateMapping} />
                                <Text>Source Attribute</Text>
                                <Text>{source}</Text>
                            </Stack>
                        </Th>
                        <Th w="75px" textTransform="none">
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
                        .map(({ value, label }) => (
                            <Tr
                                key={value}
                                borderColor="green.100"
                                _hover={{ bg: "gray.50" }}
                            >
                                <Td>{label}</Td>
                                <Td>
                                    <Select<Option, false, GroupBase<Option>>
                                        value={aggregateMetadata.sourceColumns?.find(
                                            (val) =>
                                                val.value ===
                                                attributeMapping[value ?? ""]
                                                    ?.value
                                        )}
                                        options={aggregateMetadata.sourceColumns?.map(
                                            ({ value, label }) => ({
                                                label,
                                                value,
                                            })
                                        )}
                                        isClearable
                                        onChange={(e) =>
                                            attributeMappingApi.updateMany(
                                                attributeMappingApi.updateMany({
                                                    attribute: value ?? "",
                                                    update: {
                                                        value: e?.value || "",
                                                    },
                                                })
                                            )
                                        }
                                    />
                                </Td>
                                <Td textAlign="center">
                                    {attributeMapping[value ?? ""]?.value && (
                                        <Icon
                                            as={FiCheck}
                                            color="green.400"
                                            fontSize="2xl"
                                        />
                                    )}
                                </Td>
                            </Tr>
                        ))}
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
                            of {aggregateMetadata.destinationColumns.length}
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

export default DataMapping;
