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
import { $mapping, $attributionMapping, $names, $metadata } from "../../Store";
import { attributionMappingApi } from "../../Events";
import DestinationIcon from "../DestinationIcon";
import Paginated from "../Paginated";
import Search from "../Search";
import SourceIcon from "../SourceIcon";

export default function Attribution() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const attributionMapping = useStore($attributionMapping);
    const metadata = useStore($metadata);
    const { source, destination } = useStore($names);
    const [currentAttributes, setCurrentAttributes] = useState(
        metadata.destinationCategoryOptionCombos
    );

    const mapping = useStore($mapping);

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
        } of metadata.destinationCategoryOptionCombos) {
            if (attributionMapping[destinationValue ?? ""] === undefined) {
                const search = metadata.sourceCategoryOptionCombos.find(
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
                    const search2 = metadata.sourceCategoryOptionCombos.find(
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

    const setCustom = (attribute: string, isCustom: boolean) => {
        const isSpecific = attributionMapping[attribute]?.isSpecific;
        attributionMappingApi.update({
            attribute,
            key: "isCustom",
            value: isCustom,
        });

        if (isSpecific) {
            attributionMappingApi.update({
                attribute,
                key: "isSpecific",
                value: !isSpecific,
            });
        }
    };

    const setSpecific = (attribute: string, isSpecific: boolean) => {
        attributionMappingApi.update({
            attribute,
            key: "isSpecific",
            value: isSpecific,
        });
        const isCustom = attributionMapping[attribute]?.isCustom;

        if (isCustom) {
            attributionMappingApi.update({
                attribute,
                key: "isCustom",
                value: !isCustom,
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
                options={metadata.destinationCategoryOptionCombos}
                mapping={attributionMapping}
                searchString={searchString}
                setSearchString={setSearchString}
                action={setCurrentAttributes}
                source={metadata.sourceCategoryOptionCombos}
                placeholder="Search attributes"
                label="Show Mapped Attributes Only"
                label2="Show Unmapped Attributes Only"
            />
            <Table size="sm">
                <Thead>
                    <Tr>
                        <Th textTransform="none" w="50%">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon mapping={mapping} />
                                <Text> Destination Category Option Combo</Text>
                                <Text>{destination}</Text>
                            </Stack>
                        </Th>

                        <Th textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon mapping={mapping} />
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
                                        value={metadata.sourceCategoryOptionCombos?.find(
                                            (val) =>
                                                val.value ===
                                                attributionMapping[value ?? ""]
                                                    ?.value
                                        )}
                                        options={
                                            metadata.sourceCategoryOptionCombos
                                        }
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
                            of {metadata.destinationCategoryOptionCombos.length}
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
