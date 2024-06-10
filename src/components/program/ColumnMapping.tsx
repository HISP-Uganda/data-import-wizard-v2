import { Box, Checkbox, Input, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option, RealMapping } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { $metadata } from "../../Store";
import { stageMappingApi } from "../../Events";

export default function ColumnMapping({
    isCustom,
    psId,
    customColumn,
    valueColumn,
    value,
    title,
}: {
    isCustom: boolean;
    customColumn: keyof RealMapping;
    valueColumn: keyof RealMapping;
    value: string;
    psId: string;
    title: string;
}) {
    const metadata = useStore($metadata);
    return (
        <Stack spacing="10px" flex={1}>
            <Text>{title}</Text>
            <Checkbox
                isChecked={isCustom}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    stageMappingApi.update({
                        attribute: "info",
                        stage: psId,
                        key: customColumn,
                        value: e.target.checked,
                    })
                }
            >
                Custom {title}
            </Checkbox>
            <Box>
                {isCustom ? (
                    <Input
                        value={value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            stageMappingApi.update({
                                stage: psId,
                                attribute: "info",
                                key: valueColumn,
                                value: e.target.value,
                            })
                        }
                    />
                ) : (
                    <Select<Option, false, GroupBase<Option>>
                        value={metadata.sourceColumns.find(
                            (val) => val.value === value
                        )}
                        options={metadata.sourceColumns}
                        placeholder="Select event date column"
                        isClearable
                        onChange={(e) =>
                            stageMappingApi.update({
                                stage: psId,
                                attribute: "info",
                                key: valueColumn,
                                value: e?.value,
                            })
                        }
                    />
                )}
            </Box>
        </Stack>
    );
}
