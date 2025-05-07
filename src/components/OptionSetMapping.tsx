import { Input, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { Table, Select, Modal, Button } from "antd";
import { ColumnsType } from "antd/es/table";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr, uniqBy } from "lodash/fp";
import { ChangeEvent } from "react";
import {
    $currentOptions,
    $currentSourceOptions,
    $data,
    $goDataOptions,
    $mapping,
    $metadata,
    $optionMapping,
    $tokens,
} from "../Store";

import {
    currentOptionsApi,
    currentSourceOptionsApi,
    optionMappingApi,
} from "../Events";
import DestinationIcon from "./DestinationIcon";
import SourceIcon from "./SourceIcon";
import { mediumWidth } from "../constants";

export default function OptionSetMapping({
    destinationOptions,
    value,
    disabled,
}: {
    destinationOptions: Option[];
    value: string;
    disabled: boolean;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const currentSourceOptions = useStore($currentSourceOptions);
    const currentOptions = useStore($currentOptions);
    const optionMapping = useStore($optionMapping);
    const data = useStore($data);
    const mapping = useStore($mapping);
    const metadata = useStore($metadata);
    const allTokens = useStore($tokens);
    const goDataOptions = useStore($goDataOptions);
    const columns: ColumnsType<Partial<Option>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={mapping} />
                    <Text>Destination Option</Text>
                </Stack>
            ),
            width: "50%",
            render: (_, { label, code, value }) =>
                `${label || code} (${value})`,
            key: "destination",
        },
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <SourceIcon mapping={mapping} />
                    <Text>Source Option</Text>
                </Stack>
            ),
            width: "50%",
            render: (_, { label, code, value }) => {
                if (currentSourceOptions.length > 0) {
                    return (
                        <Select
                            options={currentSourceOptions}
                            style={{ width: "100%" }}
                            mode="multiple"
                            value={optionMapping
                                .get(value || code || label || "")
                                ?.split(",")
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
                                optionMappingApi.add({
                                    key: value || "",
                                    value: e.join(","),
                                });
                            }}
                        />
                    );
                } else {
                    return (
                        <Input
                            value={optionMapping.get(code || "")}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                optionMappingApi.add({
                                    key: code || "",
                                    value: e.target.value,
                                })
                            }
                        />
                    );
                }
            },
            key: "source",
        },
    ];

    const openOptionSetDialog = (id: string, destinationOptions?: Option[]) => {
        if (
            ["xlsx-line-list", "json", "csv-line-list"].indexOf(
                mapping.dataSource ?? "",
            ) !== -1
        ) {
            currentSourceOptionsApi.set(
                uniqBy(
                    "value",
                    data.flatMap((d) => {
                        const value: string = getOr("", id, d);
                        if (value) {
                            const opt: Option = {
                                value,
                                label: value,
                            };
                            return opt;
                        }
                        return [];
                    }),
                ),
            );
        } else if (id) {
            currentSourceOptionsApi.set(
                metadata.sourceColumns.find(({ value }) => value === id)
                    ?.availableOptions ?? [],
            );
        } else if (mapping.dataSource === "go-data") {
            currentSourceOptionsApi.set(
                goDataOptions.map(({ id }) => {
                    return { label: allTokens.get(id) || id, value: id };
                }),
            );
        } else if (mapping.dataSource === "dhis2-program") {
            currentSourceOptionsApi.set(
                metadata.sourceColumns.find((curr) => value === curr.value)
                    ?.availableOptions ?? [],
            );
        }
        currentOptionsApi.set(destinationOptions || []);
        onOpen();
    };

    return (
        <Stack
            w={`${mediumWidth}px`}
            maxW={`${mediumWidth}px`}
            minW={`${mediumWidth}px`}
        >
            <Button
                onClick={() => {
                    openOptionSetDialog(value, destinationOptions);
                }}
                disabled={disabled}
            >
                Map Options
            </Button>

            <Modal
                title="Option Mapping"
                open={isOpen}
                onOk={onClose}
                onCancel={onClose}
                width={1000}
            >
                <Table
                    columns={columns}
                    dataSource={currentOptions}
                    rowKey="value"
                    pagination={{ pageSize: 7 }}
                    size="small"
                />
            </Modal>
        </Stack>
    );
}
