import { Box, Stack, StackProps, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { MappingEvent, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { mappingApi } from "../../Events";
import { $mapping } from "../../Store";

export default function SelectField({
    title,
    options,
    multiple,
    attribute,
    path,
    subPath,
    ...rest
}: {
    options: Option[];
    multiple: boolean | undefined;
} & Omit<MappingEvent, "value"> &
    StackProps) {
    const mapping = useStore($mapping);
    const currentPath = [attribute, path, subPath].filter((a) => !!a).join(".");
    return (
        <Stack {...rest}>
            <Text>{title}</Text>
            {multiple ? (
                <Box
                    flex={
                        rest.direction && rest.direction === "row"
                            ? 1
                            : undefined
                    }
                >
                    <Select<Option, true, GroupBase<Option>>
                        isMulti
                        value={options.filter((pt) => {
                            return (
                                getOr("", currentPath, mapping)
                                    .split(",")
                                    .indexOf(pt.value ?? "") !== -1
                            );
                        })}
                        onChange={(e) =>
                            mappingApi.update({
                                attribute,
                                value: e
                                    .map((ex) => String(ex.value))
                                    .join(","),
                                path,
                                subPath,
                            })
                        }
                        options={options}
                        isClearable
                        menuPlacement="auto"
                    />
                </Box>
            ) : (
                <Box
                    flex={
                        rest.direction && rest.direction === "row"
                            ? 1
                            : undefined
                    }
                >
                    <Select<Option, false, GroupBase<Option>>
                        value={options.find((pt) => {
                            return pt.value === getOr("", currentPath, mapping);
                        })}
                        onChange={(e) =>
                            mappingApi.update({
                                attribute,
                                value: e?.value,
                                path,
                                subPath,
                            })
                        }
                        options={options}
                        isClearable
                        menuPlacement="auto"
                        size="sm"
                    />
                </Box>
            )}
        </Stack>
    );
}
