import { IDataSet, IMapping, Option } from "data-import-wizard-utils";
import { createApi } from "effector";
import { set } from "lodash/fp";
import {
    $aggregateMapping,
    $dataSet,
    $dhis2DataSet,
    $indicators,
    $programIndicators,
} from "./Store";

export const aggregateMappingApi = createApi($aggregateMapping, {
    updateMany: (state, update: Partial<IMapping>) => {
        return { ...state, ...update };
    },
    update: (
        state,
        {
            attribute,
            value,
            key,
        }: { attribute: keyof IMapping; value: any; key?: string }
    ) => {
        return set(key ? `${attribute}.${key}` : attribute, value, state);
    },
});

export const dataSetApi = createApi($dataSet, {
    set: (_, dataSet: Partial<IDataSet>) => {
        return dataSet;
    },
    reset: () => ({}),
});

export const dhis2DataSetApi = createApi($dhis2DataSet, {
    set: (_, dataSet: Partial<IDataSet>) => {
        return dataSet;
    },
    reset: () => ({}),
});
export const programIndicatorApi = createApi($programIndicators, {
    set: (_, programIndicators: Option[]) => {
        return programIndicators;
    },
    reset: () => [],
});
export const indicatorApi = createApi($indicators, {
    set: (_, indicators: Option[]) => {
        return indicators;
    },
    reset: () => [],
});
