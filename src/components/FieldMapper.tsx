import { Box, Input, useToast } from "@chakra-ui/react";
import { Select } from "antd";
import { Mapping, Option, RealMapping } from "data-import-wizard-utils";
import { ChangeEvent, useEffect } from "react";
import useDebouncedResize from "../hooks/useDebouncedResize";
import { calculateWidth } from "../utils/utils";
import CustomColumn from "./CustomColumn";
export default function FieldMapper({
    isMulti,
    option,
    sourceOptions,
    mappedValues,
    onValueChange,
    mapped,
}: {
    option: Option;
    isMulti?: boolean;
    sourceOptions: Option[];
    mappedValues: string[];
    onValueChange: (val: Partial<RealMapping>) => void;
    mapped: Mapping;
}) {
    const { width } = useDebouncedResize();
    const toast = useToast();
    const { value = "" } = option;
    const item = mapped.get(value) ?? {};
    const {
        customType = "",
        isSpecific = false,
        isCustom = false,
        source = "",
    } = item;
    useEffect(() => {
        if (option.mandatory && option.unique) {
            onValueChange({ ...item, mandatory: true, unique: true });
        } else if (option.mandatory) {
            onValueChange({ ...item, mandatory: true });
        } else if (option.unique) {
            onValueChange({ ...item, unique: true });
        }
    }, []);

    if (isCustom)
        return (
            <CustomColumn
                value={source}
                onTypeUpdate={(e) =>
                    onValueChange({ customType: e?.value ?? "" })
                }
                onValueChange={(val) => onValueChange({ source: val })}
                customType={customType}
            />
        );

    if (isSpecific)
        return (
            <Input
                value={source}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onValueChange({ source: e.target.value })
                }
            />
        );

    if (isMulti)
        return (
            <Box
                width={`${calculateWidth(width) / 2}px`}
                maxWidth={`${calculateWidth(width) / 2}px`}
                minWidth={`${calculateWidth(width) / 2}px`}
            >
                <Select
                    options={sourceOptions}
                    style={{
                        width: `${calculateWidth(width) / 2}px`,
                        maxWidth: `${calculateWidth(width) / 2}px`,
                        minWidth: `${calculateWidth(width) / 2}px`,
                    }}
                    mode="multiple"
                    value={source.split(",").filter((a) => !!a)}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                        (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase()) ||
                        (option?.value ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                    onChange={async (e) => {
                        let currentValues: Partial<Option> = {
                            ...option,
                            source: e.join(","),
                        };
                        if (item) {
                            currentValues = {
                                ...item,
                                source: e.join(","),
                            };
                        }

                        onValueChange(currentValues);
                    }}
                />
            </Box>
        );
    return (
        <Box
            width={`${calculateWidth(width) / 2}px`}
            maxWidth={`${calculateWidth(width) / 2}px`}
            minWidth={`${calculateWidth(width) / 2}px`}
        >
            <Select
                options={sourceOptions}
                style={{
                    width: `${calculateWidth(width) / 2}px`,
                    maxWidth: `${calculateWidth(width) / 2}px`,
                    minWidth: `${calculateWidth(width) / 2}px`,
                }}
                value={item?.source}
                showSearch
                allowClear
                filterOption={(input, option) =>
                    (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase()) ||
                    (option?.value ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                }
                onChange={(e) => {
                    let currentValues: Partial<Option> = {
                        ...option,
                        source: e,
                    };
                    if (item) {
                        currentValues = {
                            ...item,
                            source: e,
                        };
                    }
                    onValueChange(currentValues);
                    if (e && mappedValues.indexOf(e) !== -1) {
                        toast({
                            title: "Variable reused",
                            description: `Variable ${e} already used`,
                            status: "warning",
                            duration: 9000,
                            isClosable: true,
                        });
                    }
                }}
            />
        </Box>
    );
}
