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
import { ChangeEvent } from "react";
import { Option } from "../../Interfaces";
import { updateOUMapping } from "../../pages/program/Events";
import {
    $columns,
    $organisationUnitMapping,
    $organisationUnits,
    $program,
    $programMapping,
} from "../../pages/program/Store";

const Step3 = () => {
    const programMapping = useStore($programMapping);
    const columns = useStore($columns);
    const organisations = useStore($organisationUnits);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const program = useStore($program);
    return (
        <Stack direction="row">
            <Table colorScheme="facebook" size="sm">
                <Thead>
                    <Tr>
                        <Th py="20px">Destination Organization</Th>
                        <Th w="200px" textAlign="center" py="20px">
                            Manually Map
                        </Th>
                        <Th py="20px">Source Organization</Th>
                        <Th w="100px" py="20px">
                            Mapped?
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {program.organisationUnits
                        ?.slice(0, 10)
                        .map(({ id, name, code }) => (
                            <Tr key={id}>
                                <Td w="400px">{name}</Td>
                                <Td textAlign="center">
                                    <Checkbox
                                        isChecked={
                                            getOr(
                                                {
                                                    value: "",
                                                    manual: false,
                                                },
                                                id,
                                                organisationUnitMapping
                                            ).manual
                                        }
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateOUMapping({
                                                attribute: `${id}.manual`,
                                                value: e.target.checked,
                                            })
                                        }
                                    />
                                </Td>
                                <Td>
                                    {getOr(
                                        {
                                            value: "",
                                            manual: false,
                                        },
                                        id,
                                        organisationUnitMapping
                                    ).manual ? (
                                        <Input
                                            value={
                                                getOr(
                                                    {
                                                        value: "",
                                                        manual: false,
                                                    },
                                                    id,
                                                    organisationUnitMapping
                                                ).value
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                updateOUMapping({
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
                                            value={organisations.find(
                                                (val) =>
                                                    val.value ===
                                                    getOr(
                                                        {
                                                            value: "",
                                                            manual: false,
                                                        },
                                                        id,
                                                        organisationUnitMapping
                                                    ).value
                                            )}
                                            options={organisations}
                                            isClearable
                                            onChange={(e) =>
                                                updateOUMapping({
                                                    attribute: `${id}.value`,
                                                    value: e?.value || "",
                                                })
                                            }
                                        />
                                    )}
                                </Td>
                                <Td></Td>
                            </Tr>
                        ))}
                </Tbody>
            </Table>
        </Stack>
    );
};

export default Step3;
