import { usePagination } from "@ajna/pagination";
import {
    Box,
    Checkbox,
    Icon,
    Input,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect } from "react";
import { FiCheck } from "react-icons/fi";

import {
    $attributeMapping,
    $flattenedProgramKeys,
    $metadata,
    $programMapping,
    attributeMappingApi,
    programMappingApi,
} from "../../pages/program/Store";
import DestinationIcon from "../DestinationIcon";
import OptionSetMapping from "../OptionSetMapping";
import Paginated from "../Paginated";
import SourceIcon from "../SourceIcon";

export function OtherSystemMapping() {
    const programMapping = useStore($programMapping);
    const flattenedProgramKeys = useStore($flattenedProgramKeys);
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
        total: metadata.destinationColumns.length,
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
        metadata.destinationColumns.forEach(({ value, mandatory, unique }) => {
            attributeMappingApi.updateMany({
                attribute: value,
                update: { compulsory: mandatory, unique },
            });
        });
        return () => {};
    }, []);

    const handlePageChange = (nextPage: number): void => {
        setCurrentPage(nextPage);
    };

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const pageSize = Number(event.target.value);
        setPageSize(pageSize);
    };

    return (
        <Stack>
            {programMapping.dataSource === "api" && (
                <Stack direction="row" spacing="20px">
                    <Stack direction="row" alignItems="center" flex={1}>
                        <Text>ID Field</Text>
                        <Box flex={1}>
                            <Select<Option, false, GroupBase<Option>>
                                options={flattenedProgramKeys}
                                isClearable
                                value={flattenedProgramKeys.find((value) => {
                                    return (
                                        value.value ===
                                        getOr(
                                            "",
                                            "metadataOptions.idField",
                                            programMapping
                                        )
                                    );
                                })}
                                onChange={(e) =>
                                    programMappingApi.update({
                                        attribute: "metadataOptions.idField",
                                        value: e?.value || "",
                                    })
                                }
                            />
                        </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" flex={1}>
                        <Text>Required Field</Text>
                        <Box flex={1}>
                            <Select<Option, false, GroupBase<Option>>
                                options={flattenedProgramKeys}
                                isClearable
                                value={flattenedProgramKeys.find((value) => {
                                    return (
                                        value.value ===
                                        getOr(
                                            "",
                                            "metadataOptions.requiredField",
                                            programMapping
                                        )
                                    );
                                })}
                                onChange={(e) =>
                                    programMappingApi.update({
                                        attribute:
                                            "metadataOptions.requiredField",
                                        value: e?.value || "",
                                    })
                                }
                            />
                        </Box>
                    </Stack>
                </Stack>
            )}
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
                    {metadata.destinationColumns
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
                                options,
                                optionSetValue,
                            }) => (
                                <Tr>
                                    <Td>{label}</Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                !!getOr(
                                                    false,
                                                    `${value}.compulsory`,
                                                    attributeMapping
                                                )
                                            }
                                            isReadOnly={mandatory}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                attributeMappingApi.update({
                                                    attribute: `${value}.compulsory`,
                                                    value: e.target.checked,
                                                })
                                            }
                                        />
                                    </Td>
                                    <Td textAlign="center">
                                        <Checkbox
                                            isChecked={
                                                !!getOr(
                                                    unique,
                                                    `${value}.unique`,
                                                    attributeMapping
                                                )
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
                                                attributeMappingApi.update({
                                                    attribute: `${value}.manual`,
                                                    value: e.target.checked,
                                                })
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
                                                attributeMappingApi.update({
                                                    attribute: `${value}.specific`,
                                                    value: e.target.checked,
                                                })
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
                                                value={metadata.sourceColumns.find(
                                                    (val) =>
                                                        val.value ===
                                                        getOr(
                                                            "",
                                                            `${value}.value`,
                                                            attributeMapping
                                                        )
                                                )}
                                                options={metadata.sourceColumns.map(
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
                                                options={options || []}
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
            </Table>

            <Paginated
                pages={pages}
                pagesCount={pagesCount}
                currentPage={currentPage}
                handlePageSizeChange={handlePageSizeChange}
                handlePageChange={handlePageChange}
                pageSize={pageSize}
            />
            {/* <pre>{JSON.stringify(metadata.sourceColumns, null, 2)}</pre> */}
        </Stack>
    );
}
