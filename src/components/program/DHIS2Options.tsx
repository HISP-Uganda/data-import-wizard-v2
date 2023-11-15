import { Box, Checkbox, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import {
    $metadata,
    $programMapping,
    programMappingApi,
} from "../../pages/program";

export default function DHIS2Options() {
    const metadata = useStore($metadata);
    const programMapping = useStore($programMapping);
    return (
        <Stack spacing="20px">
            <Stack>
                <Text>Specific program stage</Text>
                <Box>
                    <Select<Option, true, GroupBase<Option>>
                        options={metadata.sourceStages}
                        isClearable
                        isMulti
                        value={metadata.sourceStages.filter((value) => {
                            const available = getOr(
                                [],
                                "program.dhis2Options.programStage",
                                programMapping
                            );
                            return available.indexOf(value.value) !== -1;
                        })}
                        onChange={(e) =>
                            programMappingApi.update({
                                attribute: "program",
                                key: "dhis2Options.programStage",
                                value: e.map((ee) => ee.value),
                            })
                        }
                    />
                </Box>
            </Stack>
            <Checkbox
                isChecked={getOr(false, "prefetch", programMapping)}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    programMappingApi.update({
                        attribute: "prefetch",
                        value: e.target.checked,
                    })
                }
            >
                Prefetch
            </Checkbox>
        </Stack>
    );
}
