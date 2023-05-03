import {
    Box,
    Checkbox,
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
import { Option } from "diw-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import {
    $attributeMapping,
    $flattenedProgramKeys,
    $metadata,
    $programMapping,
    attributeMappingApi,
    programMappingApi,
} from "../../pages/program/Store";

export function OtherSystemMapping() {
    const programMapping = useStore($programMapping);
    const flattenedProgramKeys = useStore($flattenedProgramKeys);
    const metadata = useStore($metadata);
    const attributeMapping = useStore($attributeMapping);

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
                        <Th py="20px">Destination</Th>
                        <Th py="20px" w="100px" textAlign="center">
                            Mandatory
                        </Th>
                        <Th py="20px" w="100px" textAlign="center">
                            Unique
                        </Th>
                        <Th py="20px" w="200px" textAlign="center">
                            Manually Map
                        </Th>
                        <Th py="20px">Source</Th>
                        <Th w="100px" py="20px">
                            Mapped?
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {metadata.destinationColumns.map(
                        ({ value, label, unique, mandatory }) => (
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
                                <Td>
                                    {!!getOr(
                                        false,
                                        `${value}.manual`,
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
                                            options={metadata.sourceColumns}
                                            isClearable
                                            onChange={(e) =>
                                                attributeMappingApi.updateMany(
                                                    attributeMappingApi.updateMany(
                                                        {
                                                            attribute: value,
                                                            update: {
                                                                value:
                                                                    e?.value ||
                                                                    "",
                                                                unique:
                                                                    !!getOr(
                                                                        false,
                                                                        `${value}.unique`,
                                                                        attributeMapping
                                                                    ) || unique,
                                                            },
                                                        }
                                                    )
                                                )
                                            }
                                        />
                                    )}
                                </Td>
                                <Td></Td>
                            </Tr>
                        )
                    )}
                </Tbody>
            </Table>
            <pre>{JSON.stringify(attributeMapping, null, 2)}</pre>
        </Stack>
    );
}
