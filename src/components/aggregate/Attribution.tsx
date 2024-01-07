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
import {
    $aggMetadata,
    $aggregateMapping,
    $attributionMapping,
    attributionMappingApi,
} from "../../pages/aggregate";
import { $names } from "../../pages/program";
import DestinationIcon from "../DestinationIcon";
import Paginated from "../Paginated";
import Search from "../Search";
import SourceIcon from "../SourceIcon";

export default function Attribution() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const attributionMapping = useStore($attributionMapping);
    const aggregateMetadata = useStore($aggMetadata);
    const { source, destination } = useStore($names);
    const [currentAttributes, setCurrentAttributes] = useState(
        aggregateMetadata.destinationCategoryOptionCombos
    );

    const aggregateMapping = useStore($aggregateMapping);

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
            pageSize: 10,
            currentPage: 1,
        },
    });

    useEffect(() => {
        onOpen();
        for (const {
            value: destinationValue,
            label: destinationLabel,
        } of aggregateMetadata.destinationCategoryOptionCombos) {
            if (attributionMapping[destinationValue ?? ""] === undefined) {
                const search =
                    aggregateMetadata.sourceCategoryOptionCombos.find(
                        ({ value }) => value === destinationValue
                    );
                if (search) {
                    attributionMappingApi.updateMany({
                        attribute: `${destinationValue}`,
                        update: {
                            value: search.value,
                        },
                    });
                } else {
                    const search2 =
                        aggregateMetadata.sourceCategoryOptionCombos.find(
                            ({ label }) => label === destinationLabel
                        );
                    if (search2) {
                        attributionMappingApi.updateMany({
                            attribute: `${destinationValue}`,
                            update: {
                                value: search2.value,
                            },
                        });
                    }
                }
            }
        }
        onClose();
    }, []);

    const handlePageChange = (nextPage: number): void => {
        setCurrentPage(nextPage);
    };

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const pageSize = Number(event.target.value);
        setPageSize(pageSize);
    };

    const setCustom = (attribute: string, manual: boolean) => {
        const isSpecific = attributionMapping[attribute]?.specific;
        attributionMappingApi.update({
            attribute,
            key: "manual",
            value: manual,
        });

        if (isSpecific) {
            attributionMappingApi.update({
                attribute,
                key: "specific",
                value: !isSpecific,
            });
        }
    };

    const setSpecific = (attribute: string, specific: boolean) => {
        attributionMappingApi.update({
            attribute,
            key: "specific",
            value: specific,
        });
        const isManual = attributionMapping[attribute]?.manual;

        if (isManual) {
            attributionMappingApi.update({
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
                options={aggregateMetadata.destinationCategoryOptionCombos}
                mapping={attributionMapping}
                searchString={searchString}
                setSearchString={setSearchString}
                action={setCurrentAttributes}
                source={aggregateMetadata.sourceCategoryOptionCombos}
                placeholder="Search attributes"
                label="Show Mapped Attributes Only"
                label2="Show Unmapped Attributes Only"
            />
            <Table size="sm">
                <Thead>
                    <Tr>
                        <Th textTransform="none" w="50%">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon mapping={aggregateMapping} />
                                <Text> Destination Category Option Combo</Text>
                                <Text>{destination}</Text>
                            </Stack>
                        </Th>

                        <Th textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon mapping={aggregateMapping} />
                                <Text>Source Category Option Combo</Text>
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
                                        value={aggregateMetadata.sourceCategoryOptionCombos?.find(
                                            (val) =>
                                                val.value ===
                                                attributionMapping[value ?? ""]
                                                    ?.value
                                        )}
                                        options={aggregateMetadata.sourceCategoryOptionCombos?.map(
                                            ({ value, label }) => ({
                                                label,
                                                value,
                                            })
                                        )}
                                        isClearable
                                        onChange={(e) =>
                                            attributionMappingApi.updateMany(
                                                attributionMappingApi.updateMany(
                                                    {
                                                        attribute: value ?? "",
                                                        update: {
                                                            value:
                                                                e?.value || "",
                                                        },
                                                    }
                                                )
                                            )
                                        }
                                    />
                                </Td>
                                <Td textAlign="center">
                                    {attributionMapping[value ?? ""]?.value && (
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
                                Object.values(attributionMapping).filter(
                                    ({ value }) => !!value
                                ).length
                            }{" "}
                            of{" "}
                            {
                                aggregateMetadata
                                    .destinationCategoryOptionCombos.length
                            }
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
}
