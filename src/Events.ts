import {
    AggDataValue,
    AggMetadata,
    Enrollment,
    Event,
    GODataOption,
    GoResponse,
    IDataSet,
    IGoData,
    IMapping,
    IProgram,
    Mapping,
    MappingEvent,
    Option,
    RealMapping,
    StageMapping,
    StageUpdate,
    Step,
    TrackedEntityInstance,
    Update,
    updateObject,
} from "data-import-wizard-utils";
import { createApi } from "effector";
import { Dictionary } from "lodash";
import { set } from "lodash/fp";
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
    $errors,
    $goData,
    $goDataOptions,
    $indicators,
    $mapping,
    $metadata,
    $optionMapping,
    $organisationUnitMapping,
    $otherProcessed,
    $prevGoData,
    $processed,
    $processedData,
    $processedGoDataData,
    $program,
    $programIndicators,
    $programStageMapping,
    $remoteMapping,
    $remoteOrganisations,
    $token,
    $tokens,
} from "./Store";
import { defaultMapping } from "./utils/utils";
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
});

export const optionMappingApi = createApi($optionMapping, {
    set: (_, value: Record<string, string>) => value,
    add: (state, { key, value }: { key: string; value: string }) => {
        return { ...state, [key]: value };
    },
});

export const dhis2ProgramApi = createApi($dhis2Program, {
    set: (_, data: Partial<IProgram>) => data,
});

export const tokensApi = createApi($tokens, {
    set: (_, values: Dictionary<string>) => values,
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
    set: (_, data: Dictionary<string>) => data,
});
export const goDataApi = createApi($goData, {
    set: (_, data: Partial<IGoData>) => data,
});

export const processedGoDataDataApi = createApi($processedGoDataData, {
    set: (
        _,
        data: Partial<{
            errors: GoResponse;
            conflicts: GoResponse;
            processed: { updates: GoResponse; inserts: GoResponse };
        }>
    ) => data,
    reset: () => ({}),
});

export const otherProcessedApi = createApi($otherProcessed, {
    addNewInserts: (state, newInserts: any[]) => ({ ...state, newInserts }),
    addUpdates: (state, updates: any[]) => ({ ...state, updates }),
    addEvents: (state, events: any[]) => ({ ...state, events }),
    addLab: (state, labResults: { [key: string]: any }) => ({
        ...state,
        labResults,
    }),
    reset: () => ({}),
});

export const processor = createApi($processed, {
    addInstances: (
        state,
        trackedEntityInstances: Array<Partial<TrackedEntityInstance>>
    ) => {
        if (state.trackedEntityInstances) {
            return {
                ...state,
                trackedEntityInstances: [
                    ...state.trackedEntityInstances,
                    ...trackedEntityInstances,
                ],
            };
        }
        return { ...state, trackedEntityInstances };
    },

    addEnrollments: (state, enrollments: Array<Partial<Enrollment>>) => {
        if (state.enrollments) {
            return {
                ...state,
                enrollments: [...state.enrollments, ...enrollments],
            };
        }
        return { ...state, enrollments };
    },
    addEvents: (state, events: Array<Partial<Event>>) => {
        if (state.events) {
            return {
                ...state,
                events: [...state.events, ...events],
            };
        }
        return { ...state, events };
    },

    addInstanceUpdated: (
        state,
        trackedEntityInstanceUpdates: Array<Partial<TrackedEntityInstance>>
    ) => {
        if (state.trackedEntityInstanceUpdates) {
            return {
                ...state,
                trackedEntityInstanceUpdates: [
                    ...state.trackedEntityInstanceUpdates,
                    ...trackedEntityInstanceUpdates,
                ],
            };
        }
        return { ...state, trackedEntityInstanceUpdates };
    },
    addEventUpdates: (state, eventUpdates: Array<Partial<Event>>) => {
        if (state.eventUpdates) {
            return {
                ...state,
                eventUpdates: [...state.eventUpdates, ...eventUpdates],
            };
        }
        return { ...state, eventUpdates };
    },
    addErrors: (state, errors: Array<any>) => {
        if (state.errors) {
            return {
                ...state,
                errors: [...state.errors, ...errors],
            };
        }
        return { ...state, errors };
    },
    addConflicts: (state, conflicts: Array<any>) => {
        if (state.conflicts) {
            return {
                ...state,
                conflicts: [...state.conflicts, ...conflicts],
            };
        }
        return { ...state, conflicts };
    },
    reset: () => {
        return {
            trackedEntityInstances: [],
            enrollments: [],
            events: [],
            eventsUpdates: [],
            trackedEntityUpdates: [],
        };
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
    updateMany: (
        state,
        { stage, update }: { stage: string; update: Mapping }
    ) => {
        return { ...state, ...{ [stage]: { ...state[stage], ...update } } };
    },
    reset: () => ({}),
});

export const remoteMappingApi = createApi($remoteMapping, {
    update: (state, payload: Update) => {
        return updateObject(state, payload);
    },
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

export const attributeMappingApi = createApi($attributeMapping, {
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

export const ouMappingApi = createApi($organisationUnitMapping, {
    update: (state, payload: Update) => {
        return updateObject(state, payload);
    },
    set: (_, value: Mapping) => value,
    updateMany: (state, update: Mapping) => {
        return { ...state, ...update };
    },
    reset: () => ({}),
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

export const metadataApi = createApi($metadata, {
    set: (
        state,
        { key, value }: { value: Option[]; key: keyof AggMetadata }
    ) => ({ ...state, [key]: value }),
});
