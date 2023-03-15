import { ChangeEvent } from "react";

import {
    Checkbox,
    Input,
    Stack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { Option } from "../../Interfaces";
import { updateAttributeMapping } from "../../pages/program/Events";
import {
    $attributeMapping,
    $columns,
    $program,
    $programMapping,
} from "../../pages/program/Store";

const Step4 = () => {
    const programMapping = useStore($programMapping);
    const attributeMapping = useStore($attributeMapping);
    const columns = useStore($columns);
    const program = useStore($program);

    const updateAttribute = (
        attributes: { attribute: string; value: any }[]
    ) => {
        for (const { attribute, value } of attributes) {
            updateAttributeMapping({
                attribute,
                value,
            });
        }
    };

    return (
        <Stack direction="row">
            <Table size="sm">
                <Thead>
                    <Tr>
                        <Th py="20px">Destination Attribute</Th>
                        <Th textAlign="center" py="20px">
                            Mandatory
                        </Th>
                        <Th textAlign="center" py="20px">
                            Unique
                        </Th>
                        <Th textAlign="center" w="200px" py="20px">
                            Manually Map
                        </Th>
                        <Th py="20px">Source Attribute</Th>
                        <Th w="100px" py="20px">
                            Mapped?
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {program.programTrackedEntityAttributes?.map(
                        ({
                            trackedEntityAttribute: { id, name, unique },
                            mandatory,
                        }) => (
                            <Tr key={id} borderColor="green.100">
                                <Td w="400px">{name}</Td>
                                <Td textAlign="center">
                                    <Checkbox
                                        isChecked={
                                            !!getOr(
                                                false,
                                                `${id}.compulsory`,
                                                attributeMapping
                                            )
                                        }
                                        isReadOnly={mandatory}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateAttributeMapping({
                                                attribute: `${id}.compulsory`,
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
                                                `${id}.unique`,
                                                attributeMapping
                                            ) || unique
                                        }
                                        isReadOnly={unique}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateAttributeMapping({
                                                attribute: `${id}.unique`,
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
                                                `${id}.manual`,
                                                attributeMapping
                                            )
                                        }
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateAttributeMapping({
                                                attribute: `${id}.manual`,
                                                value: e.target.checked,
                                            })
                                        }
                                    />
                                </Td>
                                <Td>
                                    {!!getOr(
                                        false,
                                        `${id}.manual`,
                                        attributeMapping
                                    ) ? (
                                        <Input
                                            value={String(
                                                getOr(
                                                    "",
                                                    `${id}.value`,
                                                    attributeMapping
                                                )
                                            )}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                updateAttributeMapping({
                                                    attribute: `${id}.value`,
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
                                            value={columns.find(
                                                (val) =>
                                                    val.value ===
                                                    getOr(
                                                        "",
                                                        `${id}.value`,
                                                        attributeMapping
                                                    )
                                            )}
                                            options={columns}
                                            isClearable
                                            onChange={(e) =>
                                                updateAttribute([
                                                    {
                                                        attribute: `${id}.value`,
                                                        value: e?.value || "",
                                                    },
                                                    {
                                                        attribute: `${id}.unique`,
                                                        value:
                                                            !!getOr(
                                                                false,
                                                                `${id}.unique`,
                                                                attributeMapping
                                                            ) || unique,
                                                    },
                                                ])
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
            {/* <pre>{JSON.stringify(attributeMapping, null, 2)}</pre> */}
        </Stack>
    );
};

export default Step4;
