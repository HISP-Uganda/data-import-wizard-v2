import { Box, Checkbox, Input, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import { Option } from "../../Interfaces";
import { updateMapping } from "../../pages/program/Events";
import { IProgramMapping } from "../../pages/program/Interfaces";
import { $columns, $programMapping } from "../../pages/program/Store";

const CheckSelect = ({
    field,
    label,
    otherField,
}: {
    field: keyof IProgramMapping;
    otherField: keyof IProgramMapping;
    label: string;
}) => {
    const programMapping = useStore($programMapping);
    const columns = useStore($columns);
    return (
        <Stack spacing="10px">
            <Text w="200px">{label}</Text>
            <Stack direction="row">
                <Checkbox
                    isChecked={!!programMapping[otherField]}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: otherField,
                            value: e.target.checked,
                        })
                    }
                >
                    Manually Map {label}
                </Checkbox>
                <Box flex={1}>
                    {!programMapping[otherField] ? (
                        <Select<Option, false, GroupBase<Option>>
                            options={columns}
                            isClearable
                            value={columns.find((value) => {
                                return (
                                    value.value ===
                                    getOr("", field, programMapping)
                                );
                            })}
                            onChange={(e) =>
                                updateMapping({
                                    attribute: field,
                                    value: e?.value || "",
                                })
                            }
                        />
                    ) : (
                        <Input
                            flex={1}
                            value={String(getOr("", field, programMapping))}
                            onChange={(e) =>
                                updateMapping({
                                    attribute: field,
                                    value: e.target.value,
                                })
                            }
                        />
                    )}
                </Box>
            </Stack>
        </Stack>
    );
};

export default function Step10() {
    const programMapping = useStore($programMapping);
    return (
        <Stack spacing="20px">
            <CheckSelect
                otherField="manuallyMapOrgUnitColumn"
                field="orgUnitColumn"
                label="Organisation Unit Column"
            />

            <Stack spacing={[1, 5]} direction={["column", "row"]}>
                <Checkbox
                    colorScheme="green"
                    isChecked={programMapping.createEntities}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: "createEntities",
                            value: e.target.checked,
                        })
                    }
                >
                    Create Entities
                </Checkbox>
                <Checkbox
                    colorScheme="green"
                    isChecked={programMapping.createEnrollments}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: "createEnrollments",
                            value: e.target.checked,
                        })
                    }
                >
                    Create Enrollments
                </Checkbox>
                <Checkbox
                    colorScheme="green"
                    isChecked={programMapping.updateEntities}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: "updateEntities",
                            value: e.target.checked,
                        })
                    }
                >
                    Update Entities
                </Checkbox>
            </Stack>

            <CheckSelect
                otherField="manuallyMapEnrollmentDateColumn"
                field="enrollmentDateColumn"
                label="Enrollment Date Column"
            />
            <CheckSelect
                otherField="manuallyMapIncidentDateColumn"
                field="incidentDateColumn"
                label="Incident Date Column"
            />
        </Stack>
    );
}
