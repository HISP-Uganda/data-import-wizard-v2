import React from "react";
import { Stack, Text, StackProps, Box } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { IMapping, Option } from "data-import-wizard-utils";
import { Event } from "effector";

export default function SelectField<U extends IMapping>({
    title,
    options,
    mapping,
    multiple,
    attribute,
    api,
    otherKeys,
    ...rest
}: {
    options: Option[];
    multiple: boolean | undefined;
    mapping: Partial<U>;
    api: Event<{
        attribute: keyof U;
        value: any;
        key?: string;
    }>;
    attribute: keyof U;
    otherKeys?: string;
} & StackProps) {
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
                            if (otherKeys) {
                                return (
                                    String(
                                        Object(mapping[attribute])?.[otherKeys]
                                    )
                                        .split(",")
                                        .indexOf(pt.value) !== -1
                                );
                            }
                            return (
                                String(mapping[attribute])
                                    .split(",")
                                    .indexOf(pt.value) !== -1
                            );
                        })}
                        onChange={(e) =>
                            api({
                                attribute,
                                value: e
                                    .map((ex) => String(ex.value))
                                    .join(","),
                                key: otherKeys,
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
                            if (otherKeys) {
                                return (
                                    String(Object(mapping[attribute])) ===
                                    pt.value
                                );
                            }
                            return pt.value === String(mapping[attribute]);
                        })}
                        onChange={(e) =>
                            api({
                                attribute,
                                value: e?.value,
                                key: otherKeys,
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
