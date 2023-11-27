import {
    AggDataValue,
    IDataSet,
    IMapping,
    Mapping,
    Option,
    Update,
    updateObject,
    RealMapping,
    AggMetadata,
} from "data-import-wizard-utils";
import { createApi } from "effector";
import { create } from "lodash";
import { set } from "lodash/fp";
import {
    $aggMetadata,
    $aggregateMapping,
    $attributionMapping,
    $dataSet,
    $dhis2DataSet,
    $indicators,
    $processedData,
    $programIndicators,
    defaultMapping,
} from "./Store";

export const aggregateMappingApi = createApi($aggregateMapping, {
    set: (_, mapping: Partial<IMapping>) => mapping,
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
    reset: () => defaultMapping,
});

export const dataSetApi = createApi($dataSet, {
    set: (_, dataSet: Partial<IDataSet>) => dataSet,
    reset: () => ({}),
});

export const dhis2DataSetApi = createApi($dhis2DataSet, {
    set: (_, dataSet: Partial<IDataSet>) => dataSet,
    reset: () => ({}),
});
export const programIndicatorApi = createApi($programIndicators, {
    set: (_, programIndicators: Option[]) => programIndicators,
    reset: () => [],
});
export const indicatorApi = createApi($indicators, {
    set: (_, indicators: Option[]) => indicators,
    reset: () => [],
});
export const processedDataApi = createApi($processedData, {
    set: (_, data: Array<AggDataValue>) => data,
    add: (state, data: Array<AggDataValue>) => [...state, ...data],
});

export const attributionMappingApi = createApi($attributionMapping, {
    update: (state, payload: Update) => {
        return updateObject(state, payload);
    },
    set: (_, value: Mapping) => value,
    updateMany: (
        state,
        {
            attribute,
            update,
        }: { attribute: string; update: Partial<RealMapping> }
    ) => {
        return {
            ...state,
            ...{ [attribute]: { ...state[attribute], ...update } },
        };
    },
    reset: () => ({}),
});

export const aggMetadataApi = createApi($aggMetadata, {
    set: (
        state,
        { key, value }: { value: Option[]; key: keyof AggMetadata }
    ) => ({ ...state, [key]: value }),
});
