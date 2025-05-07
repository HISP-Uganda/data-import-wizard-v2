import {
    AggDataValue,
    AggMetadata,
    deleteNested,
    emptyProcessedData,
    EventStageMapping,
    GODataOption,
    IDataSet,
    IGoData,
    IMapping,
    IProgram,
    Mapping,
    MappingEvent,
    mapUnion,
    Option,
    Processed,
    StageMapping,
    StageUpdate,
    Step,
    updateNested,
} from "data-import-wizard-utils";
import { createApi } from "effector";
import { set } from "lodash/fp";
import { MappingUpdate, Merger } from "./Interfaces";
import {
    $activeSteps,
    $attributeMapping,
    $attributionMapping,
    $conflicts,
    $currentOptions,
    $currentSourceOptions,
    $data,
    $dataSet,
    $dhis2DataSet,
    $dhis2Program,
    $enrollmentMapping,
    $errors,
    $excel,
    $fhir,
    $goData,
    $goDataOptions,
    $indicators,
    $invalidData,
    $mapping,
    $metadata,
    $optionMapping,
    $organisationUnitMapping,
    $prevGoData,
    $processed,
    $processedData,
    $program,
    $programIndicators,
    $programStageMapping,
    $remoteMapping,
    $remoteOrganisations,
    $token,
    $tokens,
} from "./Store";
import { defaultMapping } from "./utils/utils";

const multiUpdate = (state: Mapping, { attribute, update }: MappingUpdate) => {
    const newMap: Mapping = new Map(state);
    if (!newMap.has(attribute)) {
        newMap.set(attribute, update);
    } else {
        const previous = newMap.get(attribute);
        newMap.set(attribute, { ...previous, ...update });
    }

    return newMap;
};

const deleteValue = (state: Mapping, value: string) => {
    const newMap: Mapping = new Map(state);
    newMap.delete(value);
    return newMap;
};

export const mappingApi = createApi($mapping, {
    set: (_, mapping: Partial<IMapping>) => mapping,
    update: (state, { attribute, value, path, subPath }: MappingEvent) => {
        const currentPath = [attribute, path, subPath]
            .filter((a) => !!a)
            .join(".");
        return set(currentPath, value, state);
    },
    updateMany: (state, update: Partial<IMapping>) => {
        return { ...state, ...update };
    },
    reset: (_, update: Partial<IMapping>) => update,
    updateStage: (
        state,
        {
            stage,
            update,
        }: { stage: string; update: Partial<EventStageMapping> },
    ) => {
        const prev = state.eventStageMapping?.get(stage) ?? {};
        const clone = new Map(state.eventStageMapping);
        clone.set(stage, { ...prev, ...update });
        return {
            ...state,
            eventStageMapping: clone,
        };
    },
});

export const optionMappingApi = createApi($optionMapping, {
    set: (_, value: Map<string, string>) => value,
    add: (state, { key, value }: { key: string; value: string }) => {
        const clone: Map<string, string> = new Map(state);
        clone.set(key, value);
        return clone;
    },
});

export const dhis2ProgramApi = createApi($dhis2Program, {
    set: (_, data: Partial<IProgram>) => data,
});

export const tokensApi = createApi($tokens, {
    set: (_, values: Map<string, string>) => new Map(values),
});

export const tokenApi = createApi($token, {
    set: (_, token: string) => token,
});

export const currentOptionsApi = createApi($currentOptions, {
    set: (_, options: Option[]) => options,
});

export const errorsApi = createApi($errors, {
    set: (_, data: any[]) => data,
});
export const conflictsApi = createApi($conflicts, {
    set: (_, data: any[]) => data,
});

export const prevGoDataApi = createApi($prevGoData, {
    set: (_, data: Map<string, string>) => new Map(data),
});
export const goDataApi = createApi($goData, {
    set: (_, data: Partial<IGoData>) => data,
});
export const processor = createApi($processed, {
    addDHIS2Data: (state, processedData: Processed) => {
        return {
            ...state,
            dhis2: {
                ...state.dhis2,
                trackedEntityInstances: [
                    ...state.dhis2.trackedEntityInstances,
                    ...processedData.dhis2.trackedEntityInstances,
                ],
                enrollments: [
                    ...state.dhis2.enrollments,
                    ...processedData.dhis2.enrollments,
                ],
                events: [...state.dhis2.events, ...processedData.dhis2.events],
                errors: [...state.dhis2.errors, ...processedData.dhis2.errors],
                conflicts: [
                    ...state.dhis2.conflicts,
                    ...processedData.dhis2.conflicts,
                ],
                eventUpdates: [
                    ...state.dhis2.eventUpdates,
                    ...processedData.dhis2.eventUpdates,
                ],
                enrollmentUpdates: [
                    ...state.dhis2.enrollmentUpdates,
                    ...processedData.dhis2.enrollmentUpdates,
                ],
                trackedEntityInstanceUpdates: [
                    ...state.dhis2.trackedEntityInstanceUpdates,
                    ...processedData.dhis2.trackedEntityInstanceUpdates,
                ],
            },
        };
    },
    addGoData: (state, processedData: Processed) => {
        return {
            ...state,
            goData: {
                conflicts: {
                    epidemiology: [
                        ...state.goData.conflicts.epidemiology,
                        ...processedData.goData.conflicts.epidemiology,
                    ],
                    events: [
                        ...state.goData.conflicts.events,
                        ...processedData.goData.conflicts.events,
                    ],
                    lab: [
                        ...state.goData.conflicts.lab,
                        ...processedData.goData.conflicts.lab,
                    ],
                    person: [
                        ...state.goData.conflicts.person,
                        ...processedData.goData.conflicts.person,
                    ],
                    questionnaire: [
                        ...state.goData.conflicts.questionnaire,
                        ...processedData.goData.conflicts.questionnaire,
                    ],
                    relationships: [
                        ...state.goData.conflicts.relationships,
                        ...processedData.goData.conflicts.relationships,
                    ],
                },
                errors: {
                    epidemiology: [
                        ...state.goData.errors.epidemiology,
                        ...processedData.goData.errors.epidemiology,
                    ],
                    events: [
                        ...state.goData.errors.events,
                        ...processedData.goData.errors.events,
                    ],
                    lab: [
                        ...state.goData.errors.lab,
                        ...processedData.goData.errors.lab,
                    ],
                    person: [
                        ...state.goData.errors.person,
                        ...processedData.goData.errors.person,
                    ],
                    questionnaire: [
                        ...state.goData.errors.questionnaire,
                        ...processedData.goData.errors.questionnaire,
                    ],
                    relationships: [
                        ...state.goData.errors.relationships,
                        ...processedData.goData.errors.relationships,
                    ],
                },
                inserts: {
                    epidemiology: [
                        ...state.goData.inserts.epidemiology,
                        ...processedData.goData.inserts.epidemiology,
                    ],
                    events: [
                        ...state.goData.inserts.events,
                        ...processedData.goData.inserts.events,
                    ],
                    lab: [
                        ...state.goData.inserts.lab,
                        ...processedData.goData.inserts.lab,
                    ],
                    person: [
                        ...state.goData.inserts.person,
                        ...processedData.goData.inserts.person,
                    ],
                    questionnaire: [
                        ...state.goData.inserts.questionnaire,
                        ...processedData.goData.inserts.questionnaire,
                    ],
                    relationships: [
                        ...state.goData.inserts.relationships,
                        ...processedData.goData.inserts.relationships,
                    ],
                },
                updates: {
                    epidemiology: [
                        ...state.goData.updates.epidemiology,
                        ...processedData.goData.updates.epidemiology,
                    ],
                    events: [
                        ...state.goData.updates.events,
                        ...processedData.goData.updates.events,
                    ],
                    lab: [
                        ...state.goData.updates.lab,
                        ...processedData.goData.updates.lab,
                    ],
                    person: [
                        ...state.goData.updates.person,
                        ...processedData.goData.updates.person,
                    ],
                    questionnaire: [
                        ...state.goData.updates.questionnaire,
                        ...processedData.goData.updates.questionnaire,
                    ],
                    relationships: [
                        ...state.goData.updates.relationships,
                        ...processedData.goData.updates.relationships,
                    ],
                },
            },
        };
    },
    addProcessedData: (state, processedData: Processed) => {
        return {
            ...state,
            processedData: [
                ...state.processedData,
                ...processedData.processedData,
            ],
        };
    },
    reset: () => {
        return emptyProcessedData;
    },
});

export const programApi = createApi($program, {
    set: (_, program: Partial<IProgram>) => {
        return program;
    },
    reset: () => defaultMapping,
});

export const dataApi = createApi($data, {
    changeData: (_, data: any[]) => data,
    reset: () => [],
});

export const stageMappingApi = createApi($programStageMapping, {
    update: (state, { attribute, value, stage, key }: StageUpdate) => {
        if (key) {
            return set(`${stage}.${attribute}.${key}`, value, state);
        }
        return set(`${stage}.${attribute}`, value, state);
    },
    set: (_, value: StageMapping) => value,
    updateMany: (state, { stage = "", update, attribute }: MappingUpdate) => {
        return updateNested(new Map(state), stage, attribute, (current) => ({
            ...current,
            ...update,
        }));
    },
    remove: (
        state,
        { attribute, stage }: { attribute: string; stage: string },
    ) => {
        return deleteNested(new Map(state), stage, attribute);
    },
    merge: (state, { mapping, stage = "" }: Merger) => {
        const clone = new Map(state);
        const current = clone.get(stage);
        if (current) {
            const merger = mapUnion(current, mapping);
            clone.set(stage, merger);
        }
        return clone;
    },
    reset: (state) => state.clear(),
});

export const remoteMappingApi = createApi($remoteMapping, {
    updateMany: (state, args: MappingUpdate) => {
        return multiUpdate(state, args);
    },
    reset: () => new Map(),
    merge: (state, { mapping }: Merger) => mapUnion(new Map(state), mapping),
});

export const attributeMappingApi = createApi($attributeMapping, {
    set: (_, value: Mapping) => value,
    updateMany: (state, args: MappingUpdate) => {
        return multiUpdate(state, args);
    },
    remove: (state, value: string) => {
        return deleteValue(state, value);
    },
    merge: (state, { mapping }: Merger) => mapUnion(new Map(state), mapping),
    reset: () => new Map(),
});
export const enrollmentMappingApi = createApi($enrollmentMapping, {
    set: (_, value: Mapping) => value,
    updateMany: (state, args: MappingUpdate) => {
        return multiUpdate(state, args);
    },
    remove: (state, value: string) => {
        return deleteValue(state, value);
    },
    reset: () => new Map(),
    merge: (state, { mapping }: Merger) => mapUnion(new Map(state), mapping),
});

export const ouMappingApi = createApi($organisationUnitMapping, {
    set: (_, value: Mapping) => value,
    remove: (state, value: string) => {
        return deleteValue(state, value);
    },
    updateMany: (state, args: MappingUpdate) => {
        return multiUpdate(state, args);
    },
    merge: (state, { mapping }: Merger) => mapUnion(new Map(state), mapping),
    reset: (state) => state.clear(),
});

export const remoteOrganisationsApi = createApi($remoteOrganisations, {
    set: (_, remoteOrganisations: any[]) => remoteOrganisations,
});

export const activeStepsApi = createApi($activeSteps, {
    set: (_, steps: Step[]) => steps,
});

export const goDataOptionsApi = createApi($goDataOptions, {
    set: (_, options: GODataOption[]) => options,
});
export const currentSourceOptionsApi = createApi($currentSourceOptions, {
    set: (_, options: Option[]) => options,
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

export const invalidDataApi = createApi($invalidData, {
    set: (_, data: Array<any>) => data,
    add: (state, data: Array<any>) => [...state, ...data],
});

export const attributionMappingApi = createApi($attributionMapping, {
    set: (_, value: Mapping) => value,
    updateMany: (state, args: MappingUpdate) => {
        return multiUpdate(state, args);
    },
    remove: (state, value: string) => {
        return deleteValue(state, value);
    },
    merge: (state, { mapping }: Merger) => mapUnion(new Map(state), mapping),
    reset: (state) => state.clear(),
});

export const metadataApi = createApi($metadata, {
    set: (
        state,
        { key, value }: { value: Option[]; key: keyof AggMetadata },
    ) => ({ ...state, [key]: value }),
});

export const excelApi = createApi($excel, {
    add: (state, data: any[]) => state.concat(data),
});

export const fhirApi = createApi($fhir, {
    setConcepts: (state, value: any[]) => ({ ...state, concepts: value }),
    changeLabelColumn: (state, value: string) => ({
        ...state,
        labelColumn: value,
    }),
    changeValueColumn: (state, value: string) => ({
        ...state,
        valueColumn: value,
    }),
});
