import { Box, Checkbox, Icon, Stack, Text } from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { Mapping, Option } from "data-import-wizard-utils";
import { Event } from "effector";
import { useStore } from "effector-react";
import { ChangeEvent, useMemo, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { mediumWidth, smallestWidth } from "../constants";
import { CQIDexie } from "../db";
import useDebouncedResize from "../hooks/useDebouncedResize";
import { MappingUpdate, Merger } from "../Interfaces";
import { calculateWidth, findMapped, isMapped } from "../utils/utils";
import { $mapping, $names } from "./../Store";
import AutoMap from "./AutoMap";
import DestinationIcon from "./DestinationIcon";
import FieldMapper from "./FieldMapper";
import OptionSetMapping from "./OptionSetMapping";
import Search from "./Search";
import SourceIcon from "./SourceIcon";

export default function GenericMapping({
    sourceOptions,
    destinationOptions,
    isMulti,
    stage,
    mapped,
    updater,
    db,
    merger,
    isOrgUnitMapping = false,
}: {
    sourceOptions: Option[];
    destinationOptions: Option[];
    isMulti?: boolean;
    stage?: string;
    mapped: Mapping;
    updater: Event<MappingUpdate>;
    merger: Event<Merger>;
    db: CQIDexie;
    isOrgUnitMapping?: boolean;
}) {
    const { width } = useDebouncedResize();
    const mapping = useStore($mapping);
    const { source, destination } = useStore($names);
    const [attributes, setAttributes] = useState(destinationOptions);
    const [searchString, setSearchString] = useState<string>("");
    const { matchHierarchy = false } = mapping.orgUnitMapping ?? {};
    const mappedValues = attributes?.flatMap(({ source }) => {
        if (source) {
            return source;
        }
        return [];
    });
    const columns: ColumnsType<Option> = useMemo(
        () => [
            {
                title: (
                    <Stack direction="row" alignItems="center">
                        <DestinationIcon mapping={mapping} />
                        <Text>Destination:</Text>
                        <Text>{destination}</Text>
                    </Stack>
                ),
                render: (_, { path, label }) => {
                    if (matchHierarchy && isOrgUnitMapping) return path;
                    return (
                        <Box
                            w={`${calculateWidth(width) / 2}px`}
                            maxW={`${calculateWidth(width) / 2}px`}
                            minW={`${calculateWidth(width) / 2}px`}
                        >
                            {label}
                        </Box>
                    );
                },
                width: `${calculateWidth(width) / 2}px`,
                key: "label",
            },
            {
                title: (
                    <Box
                        w={`${smallestWidth}px`}
                        maxW={`${smallestWidth}px`}
                        minW={`${smallestWidth}px`}
                    >
                        Mandatory
                    </Box>
                ),
                key: "mandatory",
                align: "center",
                width: `${smallestWidth}px`,
                render: (_, { value = "", mandatory }) => {
                    const currentValue = mapped.get(value)?.mandatory ?? false;
                    return (
                        <Box
                            w={`${smallestWidth}px`}
                            maxW={`${smallestWidth}px`}
                            minW={`${smallestWidth}px`}
                        >
                            <Checkbox
                                isChecked={currentValue || mandatory}
                                isReadOnly={mandatory}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                ) => {
                                    updater({
                                        attribute: value,
                                        update: { mandatory: e.target.checked },
                                        stage,
                                    });
                                }}
                            />
                        </Box>
                    );
                },
            },
            {
                title: (
                    <Box
                        w={`${smallestWidth}px`}
                        maxW={`${smallestWidth}px`}
                        minW={`${smallestWidth}px`}
                    >
                        Unique
                    </Box>
                ),
                key: "unique",
                width: `${smallestWidth}px`,
                align: "center",
                render: (_, { unique = false, value = "" }) => {
                    const currentValue = mapped.get(value)?.unique ?? false;
                    return (
                        <Box
                            w={`${smallestWidth}px`}
                            maxW={`${smallestWidth}px`}
                            minW={`${smallestWidth}px`}
                        >
                            <Checkbox
                                isChecked={currentValue || unique}
                                isReadOnly={unique}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                ) => {
                                    updater({
                                        attribute: value,
                                        update: { unique: e.target.checked },
                                        stage,
                                    });
                                }}
                            />
                        </Box>
                    );
                },
            },
            {
                title: (
                    <Box
                        w={`${smallestWidth}px`}
                        maxW={`${smallestWidth}px`}
                        minW={`${smallestWidth}px`}
                    >
                        Custom
                    </Box>
                ),
                key: "manual",
                width: `${smallestWidth}px`,
                align: "center",
                render: (_, { value = "" }) => {
                    const currentValue = mapped.get(value)?.isCustom ?? false;
                    return (
                        <Box
                            w={`${smallestWidth}px`}
                            maxW={`${smallestWidth}px`}
                            minW={`${smallestWidth}px`}
                        >
                            <Checkbox
                                isChecked={currentValue}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>,
                                ) => {
                                    updater({
                                        attribute: value,
                                        update: {
                                            isCustom: e.target.checked,
                                            isSpecific: false,
                                        },
                                        stage,
                                    });
                                }}
                            />
                        </Box>
                    );
                },
            },
            {
                title: (
                    <Box
                        w={`${smallestWidth}px`}
                        maxW={`${smallestWidth}px`}
                        minW={`${smallestWidth}px`}
                    >
                        Specific
                    </Box>
                ),
                key: "specific",
                width: `${smallestWidth}px`,
                align: "center",
                render: (_, { value = "" }) => {
                    const currentValue = mapped.get(value)?.isSpecific ?? false;
                    return (
                        <Checkbox
                            isChecked={currentValue}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                updater({
                                    attribute: value,
                                    update: {
                                        isSpecific: e.target.checked,
                                        isCustom: false,
                                    },
                                    stage,
                                });
                            }}
                        />
                    );
                },
            },
            {
                title: (
                    <Stack direction="row" alignItems="center">
                        <SourceIcon mapping={mapping} />
                        <Text>Source:</Text>
                        <Text>{source}</Text>
                    </Stack>
                ),
                key: "source",
                width: `${calculateWidth(width) / 2}px`,
                render: (_, option) => {
                    const { value = "" } = option;
                    return (
                        <FieldMapper
                            sourceOptions={sourceOptions}
                            option={option}
                            mappedValues={mappedValues}
                            isMulti={isMulti}
                            mapped={mapped}
                            onValueChange={(val) => {
                                updater({
                                    attribute: value,
                                    stage,
                                    update: { ...val, source: val.source },
                                });
                            }}
                        />
                    );
                },
            },
            {
                title: (
                    <Box
                        w={`${mediumWidth}px`}
                        maxW={`${mediumWidth}px`}
                        minW={`${mediumWidth}px`}
                    >
                        Options
                    </Box>
                ),
                key: "value",
                align: "center",
                width: `${mediumWidth}px`,
                render: (
                    _,
                    { value = "", optionSetValue, availableOptions },
                ) => {
                    const { source = "", format = "YYYY-MM-DD" } =
                        mapped.get(value) ?? {};
                    if (optionSetValue) {
                        return (
                            <OptionSetMapping
                                value={source}
                                disabled={!source}
                                destinationOptions={availableOptions || []}
                            />
                        );
                    }

                    return null;
                },
            },
            {
                title: (
                    <Box
                        w={`${smallestWidth}px`}
                        maxW={`${smallestWidth}px`}
                        minW={`${smallestWidth}px`}
                    >
                        Mapped
                    </Box>
                ),
                width: `${smallestWidth}px`,
                align: "center",
                render: (_, { value }) => {
                    if (isMapped(value, mapped)) {
                        return (
                            <Icon
                                as={FiCheck}
                                color="green.400"
                                fontSize="2xl"
                            />
                        );
                    }
                    return null;
                },
                key: "mapped",
            },
        ],
        [
            sourceOptions,
            destinationOptions,
            mapping,
            source,
            destination,
            matchHierarchy,
        ],
    );
    return (
        <Stack w="100%" h="100%">
            <Stack direction="row" alignItems="center" w="100%">
                <AutoMap
                    destinationOptions={attributes}
                    sourceOptions={sourceOptions}
                    db={db}
                    mapped={mapped}
                    onFinishSearch={(processed) => {
                        merger({ mapping: processed, stage });
                    }}
                    isOrgUnitMapping={isOrgUnitMapping}
                />
                <Search
                    destinationOptions={destinationOptions}
                    sourceOptions={sourceOptions}
                    mapping={mapped}
                    searchString={searchString}
                    setSearchString={setSearchString}
                    action={setAttributes}
                    placeholder="Search attributes"
                    label="Show Mapped Only"
                    label2="Show Unmapped Only"
                    label3="View Unmapped Source Data"
                />
            </Stack>

            <Table
                columns={columns}
                dataSource={attributes}
                rowKey="value"
                pagination={{ pageSize: 5, hideOnSinglePage: true }}
                size="middle"
                footer={() => (
                    <Text textAlign="right">
                        <>
                            Mapped {findMapped(Array.from(mapped.values()))} of{" "}
                            {attributes?.length ?? 0}
                        </>
                    </Text>
                )}
            />
        </Stack>
    );
}
