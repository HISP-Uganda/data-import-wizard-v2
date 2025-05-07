import { Box, Checkbox, Spacer, Stack } from "@chakra-ui/react";
import { Button, Input, Modal, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { Mapping, Option } from "data-import-wizard-utils";
import { orderBy } from "lodash";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
export default function Search({
    action,
    destinationOptions,
    setSearchString,
    searchString,
    label,
    label2,
    placeholder,
    mapping,
    sourceOptions,
    label3,
}: {
    destinationOptions: Option[];
    sourceOptions: Option[];
    action: React.Dispatch<React.SetStateAction<Option[]>>;
    setSearchString: React.Dispatch<React.SetStateAction<string>>;
    searchString: string;
    placeholder: string;
    label: string;
    label2: string;
    label3: string;
    mapping: Mapping;
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns: ColumnsType<Option> = useMemo(
        () => [
            {
                title: "Label",
                dataIndex: "label",
                key: "label",
            },
        ],
        [],
    );

    const [includeMapped, setIncludeMapped] = useState<boolean>(false);
    const [includeUnmapped, setIncludeUnmapped] = useState<boolean>(false);
    const mapped = Array.from(mapping.entries()).flatMap(([id, { source }]) => {
        if (source && sourceOptions.find((o) => o.value === source)) return id;
        return [];
    });
    const filterMapped = () => {
        const mapped = Array.from(mapping.entries()).flatMap(
            ([id, { source }]) => {
                if (source && sourceOptions.find((o) => o.value === source))
                    return id;
                return [];
            },
        );
        action(() =>
            destinationOptions.filter(
                ({ value = "" }) => mapped.indexOf(value) !== -1,
            ),
        );
    };
    const filterUnmapped = () => {
        action(() =>
            destinationOptions.filter(
                ({ value = "" }) => mapped.indexOf(value) === -1,
            ),
        );
    };

    const sourceUnMapped = () => {
        const mapped = Array.from(mapping.entries()).flatMap(
            ([_, { source }]) => {
                if (source) {
                    return source.trim().toLowerCase().replaceAll(" ", "");
                }
                return [];
            },
        );
        return orderBy(
            sourceOptions.filter(({ value = "" }) => {
                const current = value.toLowerCase().replaceAll(" ", "");
                return mapped.includes(current) === false;
            }),
            "value",
        );
    };

    const searchDestination = (search: string) => {
        setSearchString(() => search);
        action(() =>
            destinationOptions.filter(({ value, label, path }) => {
                if (path) {
                    return path.toLowerCase().includes(search.toLowerCase());
                }
                return (
                    label.toLowerCase().includes(search.toLowerCase()) ||
                    value === search.toLowerCase()
                );
            }),
        );
    };

    useEffect(() => {
        if (includeMapped && !includeUnmapped) {
            filterMapped();
        } else if (!includeMapped && includeUnmapped) {
            filterUnmapped();
        } else {
            action(() => destinationOptions);
        }
        return () => {};
    }, [includeMapped, includeUnmapped]);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Stack direction="row" flex={1}>
            <Checkbox
                isChecked={includeMapped}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    e.persist();
                    setIncludeMapped(() => e.target.checked);
                }}
            >
                {label}
            </Checkbox>
            <Checkbox
                isChecked={includeUnmapped}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    e.persist();
                    setIncludeUnmapped(() => e.target.checked);
                }}
            >
                {label2}
            </Checkbox>
            <Button type="link" onClick={() => showModal()}>
                {label3}
            </Button>
            <Spacer />
            <Box w="20%">
                <Input.Search
                    placeholder={placeholder}
                    allowClear
                    onSearch={(value) => searchDestination(value)}
                    style={{ width: "100%" }}
                    value={searchString}
                    onChange={(e) => setSearchString(e.target.value)}
                />
            </Box>
            <Modal
                title="Basic Modal"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width="50%"
            >
                <Table
                    columns={columns}
                    virtual={false}
                    pagination={false}
                    dataSource={sourceUnMapped()}
                    rowKey="value"
                />
            </Modal>
        </Stack>
    );
}
