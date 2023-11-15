import { Box, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";

import {
    $flattenedProgramKeys,
    $programMapping,
    programMappingApi,
} from "../pages/program";

export default function MetadataOptions() {
    const programMapping = useStore($programMapping);
    const flattenedProgramKeys = useStore($flattenedProgramKeys);

    return (
        <Stack>
            {programMapping.dataSource === "api" &&
                flattenedProgramKeys.length > 0 && (
                    <Stack>
                        <Stack direction="row" spacing="20px">
                            <Stack direction="row" alignItems="center" flex={1}>
                                <Text>Label Field</Text>
                                <Box flex={1}>
                                    <Select<Option, false, GroupBase<Option>>
                                        options={flattenedProgramKeys}
                                        isClearable
                                        value={flattenedProgramKeys.find(
                                            (value) => {
                                                return (
                                                    value.value ===
                                                    getOr(
                                                        "",
                                                        "metadataOptions.labelField",
                                                        programMapping
                                                    )
                                                );
                                            }
                                        )}
                                        onChange={(e) =>
                                            programMappingApi.update({
                                                attribute: "metadataOptions",
                                                value: e?.value || "",
                                                key: "labelField",
                                            })
                                        }
                                    />
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" flex={1}>
                                <Text>Value Field</Text>
                                <Box flex={1}>
                                    <Select<Option, false, GroupBase<Option>>
                                        options={flattenedProgramKeys}
                                        isClearable
                                        value={flattenedProgramKeys.find(
                                            (value) => {
                                                return (
                                                    value.value ===
                                                    getOr(
                                                        "",
                                                        "metadataOptions.valueField",
                                                        programMapping
                                                    )
                                                );
                                            }
                                        )}
                                        onChange={(e) =>
                                            programMappingApi.update({
                                                attribute: "metadataOptions",
                                                value: e?.value || "",
                                                key: "valueField",
                                            })
                                        }
                                    />
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" flex={1}>
                                <Text>ID Field</Text>
                                <Box flex={1}>
                                    <Select<Option, false, GroupBase<Option>>
                                        options={flattenedProgramKeys}
                                        isClearable
                                        value={flattenedProgramKeys.find(
                                            (value) => {
                                                return (
                                                    value.value ===
                                                    getOr(
                                                        "",
                                                        "metadataOptions.idField",
                                                        programMapping
                                                    )
                                                );
                                            }
                                        )}
                                        onChange={(e) =>
                                            programMappingApi.update({
                                                attribute: "metadataOptions",
                                                value: e?.value || "",
                                                key: "idField",
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
                                        value={flattenedProgramKeys.find(
                                            (value) => {
                                                return (
                                                    value.value ===
                                                    getOr(
                                                        "",
                                                        "metadataOptions.requiredField",
                                                        programMapping
                                                    )
                                                );
                                            }
                                        )}
                                        onChange={(e) =>
                                            programMappingApi.update({
                                                attribute: "metadataOptions",
                                                key: "requiredField",
                                                value: e?.value || "",
                                            })
                                        }
                                    />
                                </Box>
                            </Stack>
                        </Stack>
                    </Stack>
                )}
        </Stack>
    );
}
