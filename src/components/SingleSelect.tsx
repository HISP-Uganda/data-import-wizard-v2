import { Box, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Mapping, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { $metadata } from "../Store";

export default function SingleSelect({
    value,
    mapping,
    onValueChange,
    title,
}: {
    value: string;
    mapping: Mapping;
    onValueChange: (e: string | undefined) => void;
    title: string;
}) {
    const metadata = useStore($metadata);
    return (
        <Stack alignItems="center" flex={1} direction="row" spacing="20px">
            <Text>{title}</Text>
            <Box flex={1}>
                <Select<Option, false, GroupBase<Option>>
                    value={metadata.sourceColumns.filter(
                        (pt) => mapping[value].value === pt.value
                    )}
                    options={metadata.sourceColumns}
                    isClearable
                    placeholder="Select tracked entity column"
                    onChange={(e) => {
                        onValueChange(e?.value);
                    }}
                />
            </Box>
        </Stack>
    );
}
