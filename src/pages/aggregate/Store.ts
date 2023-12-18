import {
    AggDataValue,
    aggLabel,
    Authentication,
    generateUid,
    IDataSet,
    IMapping,
    makeAggMetadata,
    Mapping,
    Option,
} from "data-import-wizard-utils";
import { combine } from "effector";
import { domain } from "../../Domain";
import { $steps, $workbook } from "../../Store";
import { $data } from "../program";

const authentication: Partial<Authentication> = {};

export const defaultMapping: Partial<IMapping> = {
    id: generateUid(),
    name: "",
    description: "",
    isSource: false,
    authentication,
    dataStartRow: 2,
    headerRow: 1,
    dataSource: "manual-dhis2-program-indicators",
    isCurrentInstance: true,
    aggregate: {},
};

export const $aggregateMapping =
    domain.createStore<Partial<IMapping>>(defaultMapping);

export const $disabled = combine(
    $aggregateMapping,
    $steps,
    (aggregateMapping, steps) => false
);

export const $label = combine(
    $steps,
    $aggregateMapping,
    (step, aggregateMapping) => {
        return aggLabel(step, aggregateMapping);
    }
);

export const $metadata = combine(
    $aggregateMapping,
    $workbook,
    (aggregateMapping, workbook) => {}
);

export const $dataSet = domain.createStore<Partial<IDataSet>>({});
export const $dhis2DataSet = domain.createStore<Partial<IDataSet>>({});
export const $programIndicators = domain.createStore<Option[]>([]);
export const $indicators = domain.createStore<Option[]>([]);
export const $attributionMapping = domain.createStore<Mapping>({});

export const $aggMetadata = combine(
    $aggregateMapping,
    $dataSet,
    $data,
    $dhis2DataSet,
    $indicators,
    $programIndicators,
    (mapping, dataSet, data, dhis2DataSet, indicators, programIndicators) => {
        return makeAggMetadata({
            mapping,
            dataSet,
            data,
            dhis2DataSet,
            indicators,
            programIndicators,
        });
    }
);

export const $name = $aggregateMapping.map((state) => {
    if (state.isSource) return "Source";
    return "Destination";
});

export const $otherName = $aggregateMapping.map((state) => {
    if (state.isSource) return "Destination";
    return "Source";
});

export const $names = combine(
    $aggregateMapping,
    $dataSet,
    $dhis2DataSet,
    (aggregateMapping, dataSet, dhis2DataSet) => {
        let result: { source: string; destination: string } = {
            source: String(aggregateMapping.dataSource ?? "")
                .split("-")
                .join(" "),
            destination: dataSet.name ?? "",
        };
        if (aggregateMapping.isSource) {
            result.source = dataSet.name || "";
            if (aggregateMapping.dataSource === "dhis2-data-set") {
                result.destination = dhis2DataSet.name || "";
            }
        } else {
            result.destination = dataSet.name || "";
            if (aggregateMapping.dataSource === "dhis2-data-set") {
                result.source = dhis2DataSet.name || "";
            }
        }
        return result;
    }
);

export const $processedData = domain.createStore<AggDataValue[]>([]);

const all: { [key: string]: string[] } = {
    "csv-line-list": [
        "header-row",
        "data-start-row",
        "data-element-column",
        "ou-column",
        "pe-column",
        "coc-column",
        "aoc-column",
        "value-column",
    ],
    "xlsx-line-list": [
        "header-row",
        "data-start-row",
        "data-element-column",
        "ou-column",
        "pe-column",
        "coc-column",
        "aoc-column",
        "value-column",
    ],
    "xlsx-tabular-data": [
        "data-start-row",
        "ou-column",
        "pe-column",
        "attribution",
    ],
    "xlsx-form": [
        "data-element-column",
        "ou-column",
        "pe-column",
        "coc-column",
        "aoc-column",
        "value-column",
    ],
    "dhis2-indicators": ["indicator-generation-level"],
    "dhis2-program-indicators": ["indicator-generation-level"],
};

export const $configList = $aggregateMapping.map((state) => {
    if (state.dataSource) {
        if (state.useColumnLetters) {
            return all[state.dataSource]?.filter((x) => x !== "header-row");
        }
        return all[state.dataSource] || [];
    }
    return [];
});
