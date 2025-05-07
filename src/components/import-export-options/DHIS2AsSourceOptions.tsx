import { Checkbox, Input, Stack, Text } from "@chakra-ui/react";
import { Tabs } from "antd";
import { DisabledPeriod } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect } from "react";
import { CQIDexie } from "../../db";
import { mappingApi } from "../../Events";
import { $mapping } from "../../Store";
import OUTree from "../OuTree";
import PeriodPicker from "../PeriodPicker";
import SwitchComponent, { Case } from "../SwitchComponent";
import AttributeFilters from "./AttributeFilters";
import DataElementFilters from "./DataElementFilters";
import NumberProperty from "../mapping-fields/NumberProperty";

export default function DHIS2AsSourceOptions({ db }: { db: CQIDexie }) {
    const mapping = useStore($mapping);
    const findDisabled = (): DisabledPeriod[] => {
        if (mapping.dataSource === "dhis2-data-set") {
            return [0];
        }
        if (mapping.dataSource === "dhis2-program") {
            return [0, 1];
        }

        if (mapping.isSource) {
            return [0, 1];
        }
        return [];
    };

    const findActive = () => {
        if (mapping.dataSource === "dhis2-data-set") {
            return 1;
        }
        if (mapping.dataSource === "dhis2-program") {
            return 2;
        }

        if (mapping.isSource) {
            return 2;
        }

        return 0;
    };

    useEffect(() => {
        if (mapping.dataSource === "dhis2-program") {
            if (mapping.dhis2SourceOptions?.searchPeriod === undefined) {
                mappingApi.update({
                    attribute: "dhis2SourceOptions",
                    path: "searchPeriod",
                    value: "enrollmentDate",
                });
            }

            if (mapping.dhis2SourceOptions?.fetchBy === undefined) {
                mappingApi.update({
                    attribute: "dhis2SourceOptions",
                    path: "fetchBy",
                    value: "program",
                });
            }

            if (mapping.dhis2SourceOptions?.flattenBy === undefined) {
                mappingApi.update({
                    attribute: "dhis2SourceOptions",
                    path: "flattenBy",
                    value: "events",
                });
            }
        }
        return () => {};
    }, []);

    return (
        <Stack
            spacing="30px"
            borderWidth="2px"
            borderRadius="lg"
            borderColor="gray.200"
            _hover={{ borderColor: "blue.500" }}
            transition="all 0.2s"
            px={4}
            py={2}
            boxShadow="sm"
        >
            <Text>Source Options</Text>
            <Stack>
                <Stack spacing="20px">
                    <Checkbox
                        isChecked={getOr(false, "prefetch", mapping)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "prefetch",
                                value: e.target.checked,
                            })
                        }
                    >
                        Preview
                    </Checkbox>
                </Stack>

                <Tabs
                    items={[
                        {
                            key: "1",
                            label: "Initial",
                            children: (
                                <SwitchComponent
                                    condition={
                                        mapping.dataSource ===
                                            "dhis2-program" || mapping.isSource
                                    }
                                >
                                    <Case value={true}>
                                        <Stack>
                                            <NumberProperty
                                                title="Source Chunk Size"
                                                attribute="dhis2SourceOptions"
                                                min={5}
                                                step={1}
                                                value={
                                                    mapping.dhis2SourceOptions
                                                        ?.chunkSize
                                                }
                                                onChange={(value) =>
                                                    mappingApi.update({
                                                        attribute:
                                                            "dhis2SourceOptions",
                                                        path: "chunkSize",
                                                        value,
                                                    })
                                                }
                                            />
                                            {mapping.program?.isTracker && (
                                                <Stack>
                                                    <Text>Search by</Text>
                                                    <Stack
                                                        spacing={5}
                                                        direction="row"
                                                    >
                                                        <Checkbox
                                                            isChecked={
                                                                mapping
                                                                    .dhis2SourceOptions
                                                                    ?.fetchBy ===
                                                                "program"
                                                            }
                                                            onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                                mappingApi.update(
                                                                    {
                                                                        attribute:
                                                                            "dhis2SourceOptions",
                                                                        path: "fetchBy",
                                                                        value: "program",
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Program
                                                        </Checkbox>
                                                        <Checkbox
                                                            isChecked={
                                                                mapping
                                                                    .dhis2SourceOptions
                                                                    ?.fetchBy ===
                                                                "trackedEntityType"
                                                            }
                                                            onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                                mappingApi.update(
                                                                    {
                                                                        attribute:
                                                                            "dhis2SourceOptions",
                                                                        path: "fetchBy",
                                                                        value: "trackedEntityType",
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Tracked Entity Type
                                                        </Checkbox>
                                                    </Stack>
                                                    <Text>Flatten by</Text>
                                                    <Stack
                                                        spacing={5}
                                                        direction="row"
                                                    >
                                                        <Checkbox
                                                            isChecked={
                                                                mapping
                                                                    .dhis2SourceOptions
                                                                    ?.flattenBy ===
                                                                "trackedEntities"
                                                            }
                                                            onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                                mappingApi.update(
                                                                    {
                                                                        attribute:
                                                                            "dhis2SourceOptions",
                                                                        path: "flattenBy",
                                                                        value: "trackedEntities",
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Tracked Entities
                                                        </Checkbox>
                                                        <Checkbox
                                                            isChecked={
                                                                mapping
                                                                    .dhis2SourceOptions
                                                                    ?.flattenBy ===
                                                                "enrollments"
                                                            }
                                                            onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                                mappingApi.update(
                                                                    {
                                                                        attribute:
                                                                            "dhis2SourceOptions",
                                                                        path: "flattenBy",
                                                                        value: "enrollments",
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Enrollments
                                                        </Checkbox>
                                                        <Checkbox
                                                            isChecked={
                                                                mapping
                                                                    .dhis2SourceOptions
                                                                    ?.flattenBy ===
                                                                "events"
                                                            }
                                                            onChange={(
                                                                e: ChangeEvent<HTMLInputElement>,
                                                            ) =>
                                                                mappingApi.update(
                                                                    {
                                                                        attribute:
                                                                            "dhis2SourceOptions",
                                                                        path: "flattenBy",
                                                                        value: "events",
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Events
                                                        </Checkbox>
                                                    </Stack>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Case>
                                    <Case default>{null}</Case>
                                </SwitchComponent>
                            ),
                        },
                        {
                            key: "2",
                            label: "Period",
                            children: (
                                <Stack>
                                    <PeriodPicker
                                        selectedPeriods={
                                            mapping.dhis2SourceOptions
                                                ?.period ?? []
                                        }
                                        disabled={findDisabled()}
                                        active={findActive()}
                                        onChange={(periods) =>
                                            mappingApi.update({
                                                attribute: "dhis2SourceOptions",
                                                path: "period",
                                                value: periods,
                                            })
                                        }
                                    />
                                    <Text>Period Applies To</Text>
                                    <Stack spacing={5} direction="row">
                                        <Checkbox
                                            isChecked={
                                                mapping.dhis2SourceOptions
                                                    ?.searchPeriod ===
                                                "enrollmentDate"
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                mappingApi.update({
                                                    attribute:
                                                        "dhis2SourceOptions",
                                                    path: "searchPeriod",
                                                    value: "enrollmentDate",
                                                })
                                            }
                                        >
                                            Enrollment Date
                                        </Checkbox>
                                        <Checkbox
                                            isChecked={
                                                mapping.dhis2SourceOptions
                                                    ?.searchPeriod ===
                                                "eventDate"
                                            }
                                            isDisabled={
                                                !mapping.dhis2SourceOptions
                                                    ?.programStages?.length
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                mappingApi.update({
                                                    attribute:
                                                        "dhis2SourceOptions",
                                                    path: "searchPeriod",
                                                    value: "eventDate",
                                                })
                                            }
                                        >
                                            Event Date
                                        </Checkbox>
                                    </Stack>
                                </Stack>
                            ),
                        },
                        {
                            key: "3",
                            label: "Organisation",
                            children: (
                                <OUTree
                                    value={
                                        mapping.dhis2SourceOptions?.ous ?? []
                                    }
                                    onChange={(ous) =>
                                        mappingApi.update({
                                            attribute: "dhis2SourceOptions",
                                            path: "ous",
                                            value: ous,
                                        })
                                    }
                                    db={db}
                                />
                            ),
                        },
                        {
                            key: "4",
                            label: "Specific Tracked Entities",
                            children: (
                                <>
                                    {mapping.program?.isTracker && (
                                        <Input
                                            value={
                                                mapping.dhis2SourceOptions
                                                    ?.trackedEntityInstance ??
                                                ""
                                            }
                                            onChange={(value) =>
                                                mappingApi.update({
                                                    attribute:
                                                        "dhis2SourceOptions",
                                                    path: "trackedEntityInstance",
                                                    value: value.target.value,
                                                })
                                            }
                                        />
                                    )}
                                </>
                            ),
                        },
                        {
                            key: "5",
                            label: "Attribute Filters",
                            children: <AttributeFilters />,
                        },
                        {
                            key: "6",
                            label: "Data Element Filters",
                            children: <DataElementFilters />,
                        },
                    ]}
                />
            </Stack>
        </Stack>
    );
}
