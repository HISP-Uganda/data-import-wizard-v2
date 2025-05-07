import { Checkbox, Stack } from "@chakra-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { CQIDexie } from "../../db";

import { dataApi, mappingApi } from "../../Events";
import { $configList, $mapping, $metadata, $workbook } from "../../Store";
import { generateData } from "../../utils/utils";
import NumberProperty from "../mapping-fields/NumberProperty";
import SelectField from "../mapping-fields/SelectProperty";

export default function Configuration({ db }: { db: CQIDexie }) {
    const mapping = useStore($mapping);
    const metadata = useStore($metadata);
    const configList = useStore($configList);
    const workbook = useStore($workbook);

    const levels = useLiveQuery(() => db.levels.toArray());

    const allFields: Array<{ id: string; element: React.ReactNode }> = [
        {
            id: "header-row",
            element: (
                <NumberProperty
                    title="Header row"
                    attribute="headerRow"
                    key="header-row"
                    value={mapping.headerRow}
                    onChange={() => {
                        if (workbook && mapping.sheet) {
                            const actual = generateData(
                                mapping,
                                workbook,
                                "json",
                            );
                            dataApi.changeData(actual);
                        }
                    }}
                />
            ),
        },
        {
            id: "data-start-row",
            element: (
                <NumberProperty
                    title="Data start row"
                    attribute="dataStartRow"
                    key="data-start-row"
                    value={mapping.dataStartRow}
                    onChange={() => {
                        if (workbook && mapping.sheet) {
                            const actual = generateData(
                                mapping,
                                workbook,
                                "json",
                            );
                            dataApi.changeData(actual);
                        }
                    }}
                />
            ),
        },
        {
            id: "data-element-column",
            element: (
                <SelectField
                    title="Data Element column"
                    attribute="aggregate"
                    options={metadata.sourceColumns}
                    multiple={false}
                    path="dataElementColumn"
                    key="data-element-column"
                />
            ),
        },
        {
            id: "pe-column",
            element: (
                <SelectField
                    title="Period column"
                    attribute="aggregate"
                    path="periodColumn"
                    options={metadata.sourceColumns}
                    multiple={false}
                    key="pe-column"
                />
            ),
        },
        {
            id: "coc-column",
            element: (
                <SelectField
                    title="Category option combo column"
                    attribute="aggregate"
                    path="categoryOptionComboColumn"
                    options={metadata.sourceColumns}
                    multiple={false}
                    key="coc-column"
                />
            ),
        },
        {
            id: "aoc-column",
            element: (
                <SelectField
                    title="Attribute option combo column"
                    attribute="attributeOptionComboColumn"
                    options={metadata.sourceColumns}
                    multiple={false}
                    key="aoc-column"
                />
            ),
        },
        {
            id: "value-column",
            element: (
                <SelectField
                    title="Value column"
                    attribute="aggregate"
                    options={metadata.sourceColumns}
                    multiple={false}
                    path="valueColumn"
                    key="value-column"
                />
            ),
        },
        {
            id: "attribution",
            element: (
                <Stack spacing="30px" key="attribution">
                    <Checkbox
                        isChecked={mapping.attributionMerged}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.updateMany({
                                attributionMerged: e.target.checked,
                            })
                        }
                    >
                        Data Set Attribution merged
                    </Checkbox>
                    {mapping.attributionMerged ? (
                        <SelectField
                            title="Attribute option combo column"
                            attribute="attributeOptionComboColumn"
                            options={metadata.sourceColumns}
                            multiple={false}
                        />
                    ) : (
                        <Stack
                            direction="row"
                            spacing="20px"
                            alignItems="center"
                        >
                            {metadata.destinationCategories.map(
                                ({ label, value }) => (
                                    <SelectField
                                        title={`${label} Column`}
                                        attribute="aggregate"
                                        options={metadata.sourceColumns}
                                        multiple={false}
                                        path="categoryColumns"
                                        subPath={value}
                                        flex={1}
                                        key={value}
                                    />
                                ),
                            )}
                        </Stack>
                    )}
                </Stack>
            ),
        },
        {
            id: "indicator-generation-level",
            element: (
                <Stack key="indicator-generation-level">
                    <SelectField
                        title="Indicator generation level"
                        attribute="aggregate"
                        path="indicatorGenerationLevel"
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
