import { Box, Checkbox, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import { mappingApi } from "../../Events";
import { $mapping, $metadata } from "../../Store";
export default function DHIS2Options() {
    const metadata = useStore($metadata);
    const programMapping = useStore($mapping);
    return (
        <Stack spacing="20px">
            <Checkbox
                isChecked={getOr(false, "prefetch", programMapping)}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    mappingApi.update({
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
