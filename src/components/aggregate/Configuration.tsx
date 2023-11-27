import { Checkbox, Stack } from "@chakra-ui/react";
import { IMapping } from "data-import-wizard-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useStore } from "effector-react";
import { ChangeEvent, useEffect } from "react";
import { db } from "../../db";

import {
    $aggMetadata,
    $aggregateMapping,
    $configList,
    $dataSet,
    aggregateMappingApi,
} from "../../pages/aggregate";
import NumberProperty from "../fields/NumberProperty";
import SelectField from "../fields/SelectProperty";

export default function Configuration() {
    const aggregateMapping = useStore($aggregateMapping);
    const aggregateMetadata = useStore($aggMetadata);
    const configList = useStore($configList);
    const dataSet = useStore($dataSet);

    const levels = useLiveQuery(() => db.levels.toArray());

    const setHasAttribution = () => {
        const categories = dataSet.categoryCombo?.categories.filter(
            ({ name }) => name !== "default"
        );
        if (categories && categories.length > 0) {
            aggregateMappingApi.update({
                attribute: "aggregate",
                value: true,
                key: "hasAttribution",
            });
        } else {
            aggregateMappingApi.update({
                attribute: "aggregate",
                value: false,
                key: "hasAttribution",
            });
        }
    };

    useEffect(() => {
        setHasAttribution();
        return () => {};
    }, []);

    const allFields: Array<{ id: string; element: React.ReactNode }> = [
        {
            id: "header-row",
            element: (
                <NumberProperty<IMapping>
                    title="Header row"
                    api={aggregateMappingApi.update}
                    attribute="headerRow"
                    mapping={aggregateMapping}
                />
            ),
        },
        {
            id: "data-start-row",
            element: (
                <NumberProperty<IMapping>
                    title="Data start row"
                    api={aggregateMappingApi.update}
                    attribute="dataStartRow"
                    mapping={aggregateMapping}
                />
            ),
        },
        {
            id: "ou-column",
            element: (
                <SelectField<IMapping>
                    title="Organisation column"
                    api={aggregateMappingApi.update}
                    attribute="orgUnitColumn"
                    mapping={aggregateMapping}
                    options={aggregateMetadata.sourceColumns}
                    multiple={false}
                />
            ),
        },
        {
            id: "data-element-column",
            element: (
                <SelectField<IMapping>
                    title="Data Element column"
                    api={aggregateMappingApi.update}
                    attribute="aggregate"
                    mapping={aggregateMapping}
                    options={aggregateMetadata.sourceColumns}
                    multiple={false}
                    otherKeys="dataElementColumn"
                />
            ),
        },
        {
            id: "pe-column",
            element: (
                <SelectField<IMapping>
                    title="Period column"
                    api={aggregateMappingApi.update}
                    attribute="aggregate"
                    otherKeys="periodColumn"
                    mapping={aggregateMapping}
                    options={aggregateMetadata.sourceColumns}
                    multiple={false}
                />
            ),
        },
        {
            id: "coc-column",
            element: (
                <SelectField<IMapping>
                    title="Category option combo column"
                    api={aggregateMappingApi.update}
                    attribute="aggregate"
                    otherKeys="categoryOptionComboColumn"
                    mapping={aggregateMapping}
                    options={aggregateMetadata.sourceColumns}
                    multiple={false}
                />
            ),
        },
        {
            id: "aoc-column",
            element: (
                <SelectField<IMapping>
                    title="Attribute option combo column"
                    api={aggregateMappingApi.update}
                    attribute="aggregate"
                    mapping={aggregateMapping}
                    options={aggregateMetadata.sourceColumns}
                    multiple={false}
                    otherKeys="attributeOptionComboColumn"
                />
            ),
        },
        {
            id: "value-column",
            element: (
                <SelectField<IMapping>
                    title="Value column"
                    api={aggregateMappingApi.update}
                    attribute="aggregate"
                    mapping={aggregateMapping}
                    options={aggregateMetadata.sourceColumns}
                    multiple={false}
                    otherKeys="valueColumn"
                />
            ),
        },
        {
            id: "attribution",
            element: (
                <Stack spacing="30px">
                    <Checkbox
                        isChecked={
                            aggregateMapping.aggregate?.attributionMerged
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            aggregateMappingApi.update({
                                attribute: "aggregate",
                                value: e.target.checked,
                                key: "attributionMerged",
                            })
                        }
                    >
                        Data Set Attribution merged
                    </Checkbox>
                    {aggregateMapping.aggregate?.attributionMerged ? (
                        <SelectField<IMapping>
                            title="Attribute option combo column"
                            api={aggregateMappingApi.update}
                            attribute="aggregate"
                            mapping={aggregateMapping}
                            options={aggregateMetadata.sourceColumns}
                            multiple={false}
                            otherKeys="attributeOptionComboColumn"
                        />
                    ) : (
                        <Stack
                            direction="row"
                            spacing="20px"
                            alignItems="center"
                        >
                            {aggregateMetadata.destinationCategories.map(
                                ({ label, value }) => (
                                    <SelectField<IMapping>
                                        title={`${label} Column`}
                                        api={aggregateMappingApi.update}
                                        attribute="aggregate"
                                        mapping={aggregateMapping}
                                        options={
                                            aggregateMetadata.sourceColumns
                                        }
                                        multiple={false}
                                        otherKeys={`categoryColumns.${value}`}
                                        flex={1}
                                    />
                                )
                            )}
                        </Stack>
                    )}
                </Stack>
            ),
        },
        {
            id: "indicator-generation-level",
            element: (
                <Stack>
                    <SelectField<IMapping>
                        title="Indicator generation level"
                        api={aggregateMappingApi.update}
                        attribute="aggregate"
                        otherKeys="indicatorGenerationLevel"
                        mapping={aggregateMapping}
                        options={levels ?? []}
                        multiple={false}
                    />
                </Stack>
            ),
        },
    ];

    return (
        <Stack spacing="30px">
            {allFields
                .filter(({ id }) => configList.indexOf(id) !== -1)
                .map(({ element }) => element)}
        </Stack>
    );
}
