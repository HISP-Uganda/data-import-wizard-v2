import {
    Enrollment,
    Event,
    GoResponse,
    IGoData,
    IMapping,
    IProgram,
    Mapping,
    Option,
    RealMapping,
    StageMapping,
    StageUpdate,
    TrackedEntityInstance,
    Update,
    updateObject,
} from "data-import-wizard-utils";
import { createApi } from "effector";
import { Dictionary } from "lodash";
import { set } from "lodash/fp";
import {
    $attributeMapping,
    $conflicts,
    $currentOptions,
    $data,
    $dhis2Program,
    $errors,
    $goData,
    $optionMapping,
    $organisationUnitMapping,
    $otherProcessed,
    $prevGoData,
    $processed,
    $processedGoDataData,
    $program,
    $programMapping,
    $programStageMapping,
    $remoteMapping,
    $remoteOrganisations,
    $token,
    $tokens,
    defaultMapping,
} from "./Store";

// export const setIProgramProperty = domain.createEvent<{
//     attribute: keyof IProgram;
//     value: IProgram[keyof IProgram];
// }>();

// export const setMapping = domain.createEvent<Partial<IProgramMapping>>();
// export const updateMapping = domain.createEvent<{
//     attribute: keyof IProgramMapping;
//     value: IProgramMapping[keyof IProgramMapping];
// }>();

// export const changeData = domain.createEvent<any[]>();

// export const updateOUMapping = domain.createEvent<{
//     attribute: string;
//     value: any;
// }>();

// export const updateAttributeMapping = domain.createEvent<{
//     attribute: string;
//     value: any;
// }>();

// export const updateProgramStageMapping = domain.createEvent<{
//     stage: string;
//     attribute: string;
//     value: any;
// }>();

// export const setProgram = domain.createEvent<Partial<IProgram>>();

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
        trackedEntities: Array<Partial<TrackedEntityInstance>>
    ) => {
        if (state.trackedEntities) {
            return {
                ...state,
                trackedEntities: [...state.trackedEntities, ...trackedEntities],
            };
        }
        return { ...state, trackedEntities };
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
        trackedEntityUpdates: Array<Partial<TrackedEntityInstance>>
    ) => {
        if (state.trackedEntityUpdates) {
            return {
                ...state,
                trackedEntityUpdates: [
                    ...state.trackedEntityUpdates,
                    ...trackedEntityUpdates,
                ],
            };
        }
        return { ...state, trackedEntityUpdates };
    },
    addEventUpdates: (state, eventsUpdates: Array<Partial<Event>>) => {
        if (state.eventsUpdates) {
            return {
                ...state,
                eventUpdates: [...state.eventsUpdates, ...eventsUpdates],
            };
        }
        return { ...state, eventsUpdates };
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

export const programMappingApi = createApi($programMapping, {
    set: (_, mapping: Partial<IMapping>) => mapping,
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
    updateMany: (state, update: Partial<IMapping>) => {
        return { ...state, ...update };
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
