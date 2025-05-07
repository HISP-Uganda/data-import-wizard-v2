import { Checkbox, Input, Stack, Text } from "@chakra-ui/react";
import { Select } from "antd";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { $mapping, $metadata } from "../Store";

export default function InfoMapping({
    title,
    isChecked,
    value,
    title2,
    isMulti,
    onCustomChange,
    onValueChange,
    children,
}: {
    title: string;
    title2: string;
    isChecked: boolean | undefined;
    value: string | undefined;
    isMulti?: boolean;
    onCustomChange: (value: boolean | undefined) => void;
    onValueChange: (value: string | undefined) => void;
    children?: React.ReactNode;
}) {
    const metadata = useStore($metadata);
    const mapping = useStore($mapping);
    return (
        <Stack direction="column" flex={1}>
            <Text>{title}</Text>
            <Stack spacing="0" flex={1}>
                {[
                    "csv-line-list",
                    "xlsx-line-list",
                    "xlsx-tabular-data",
                    "xlsx-form",
                    "dhis2-data-set",
                    "dhis2-indicators",
                    "dhis2-program-indicators",
                    "dhis2-program",
                    "manual-dhis2-program-indicators",
                ].indexOf(mapping.dataSource ?? "") === -1 ? (
                    <Checkbox
                        isChecked={isChecked}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            onCustomChange(e.target.checked);
                        }}
                    >
                        {title2}
                    </Checkbox>
                ) : null}
                <Stack
                    direction="row"
                    flex={1}
                    alignItems="center"
                    width="100%"
                >
                    {isChecked ? (
                        <Input
                            value={value}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                onValueChange(e.target.value);
                            }}
                            style={{ flex: 1 }}
                        />
                    ) : isMulti ? (
                        <Select
                            options={metadata.sourceColumns}
                            style={{ flex: 1 }}
                            mode="multiple"
                            value={String(value)
                                .split(",")
                                .filter((a) => !!a)}
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
                                onValueChange(
                                    e
                                        .flatMap((a) => {
                                            if (a) {
                                                return a;
                                            }
                                            return [];
                                        })
                                        .join(","),
                                );
                            }}
                        />
                    ) : (
                        <Select
                            options={metadata.sourceColumns}
                            style={{ width: "100%", flex: 1 }}
                            value={value}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase()) ||
                                (option?.value ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            onChange={(e) => {
                                onValueChange(e);
                            }}
                            allowClear
                        />
                    )}
                    {children}
                </Stack>
            </Stack>
        </Stack>
    );
}
