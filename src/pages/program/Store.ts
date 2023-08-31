import {
    Authentication,
    canQueryDHIS2,
    Enrollment,
    Event,
    findColumns,
    flattenProgram,
    generateUid,
    GODataOption,
    IGoData,
    IProgram,
    IProgramMapping,
    isDisabled,
    label,
    makeMetadata,
    makeRemoteApi,
    makeValidation,
    mandatoryAttributes,
    Mapping,
    Option,
    programStageUniqColumns,
    programStageUniqElements,
    programUniqAttributes,
    programUniqColumns,
    RealMapping,
    StageMapping,
    TrackedEntityInstance,
    Update,
    updateObject,
} from "data-import-wizard-utils";

import { combine, createApi } from "effector";
import produce from "immer";
import { Dictionary, drop } from "lodash";
import { isEmpty, set } from "lodash/fp";
import { z } from "zod";
import { domain } from "../../Domain";
import { $steps } from "../../Store";

type StageUpdate = Update & { stage: string };

type Processed = {
    trackedEntities: Array<Partial<TrackedEntityInstance>>;
    enrollments: Array<Partial<Enrollment>>;
    events: Array<Partial<Event>>;
    trackedEntityUpdates: Array<Partial<TrackedEntityInstance>>;
    eventsUpdates: Array<Partial<Event>>;
};

type OtherProcessed = {
    newInserts: Array<any>;
    updates: Array<any>;
};

const authentication: Partial<Authentication> = {
    basicAuth: true,
    url: "https://go.sk-engine.cloud",
    // url: "https://apitest.cphluganda.org/case_details",
    username: "colupot@hispuganda.org",
    password: "Tesocollege77",
    // username: "",
    // password: "",
    // params: {
    //     token: {
    //         param: "token",
    //         value: "PMAK-5ed7e01fdfcba0004d318db7-1e8d8c59a69c393b173c31d47dd1014267",
    //     },
    //     start: {
    //         param: "start",
    //         value: "2020-07-31",
    //     },
    //     end: {
    //         param: "end",
    //         value: "2020-07-31",
    //     },
    // },
};

const defaultMapping: Partial<IProgramMapping> = {
    id: generateUid(),
    name: "Example Mapping",
    description: "This an example mapping",
    dataSource: "godata",
    isSource: false,
    authentication,
    prefetch: true,
};
const mySchema = z.string().url();

export const $attributeMapping = domain.createStore<Mapping>({});
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
});

export const $remoteMapping = domain.createStore<Mapping>({});
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
});

export const $remoteOrganisations = domain.createStore<any[]>([]);
export const remoteOrganisationsApi = createApi($remoteOrganisations, {
    set: (_, remoteOrganisations: any[]) => remoteOrganisations,
});
export const $programStageMapping = domain.createStore<StageMapping>({});

export const stageMappingApi = createApi($programStageMapping, {
    update: (state, { attribute, value, stage, key }: StageUpdate) => {
        return set(`${stage}.${attribute}.${key}`, value, state);
    },
    set: (_, value: StageMapping) => value,
    updateMany: (
        state,
        { stage, update }: { stage: string; update: Mapping }
    ) => {
        return { ...state, ...{ [stage]: { ...state[stage], ...update } } };
    },
});
export const $organisationUnitMapping = domain.createStore<Mapping>({});

export const ouMappingApi = createApi($organisationUnitMapping, {
    update: (state, payload: Update) => {
        return updateObject(state, payload);
    },
    set: (_, value: Mapping) => value,
    updateMany: (state, update: Mapping) => {
        return { ...state, ...update };
    },
});
export const $data = domain.createStore<any[]>([]);

export const dataApi = createApi($data, {
    changeData: (_, data: any[]) => data,
});

export const $programMapping =
    domain.createStore<Partial<IProgramMapping>>(defaultMapping);

export const programMappingApi = createApi($programMapping, {
    set: (_, mapping: Partial<IProgramMapping>) => mapping,
    update: (
        state,
        {
            attribute,
            value,
            key,
        }: { attribute: keyof IProgramMapping; value: any; key?: string }
    ) => {
        return set(key ? `${attribute}.${key}` : attribute, value, state);
    },
    updateMany: (state, update: Partial<IProgramMapping>) => {
        return { ...state, ...update };
    },
});

export const $columns = $data.map((state) => findColumns(state));

export const $program = domain.createStore<Partial<IProgram>>({});

export const programApi = createApi($program, {
    set: (_, program: Partial<IProgram>) => {
        return program;
    },
});

export const $processed = domain.createStore<Partial<Processed>>({});
export const $otherProcessed = domain.createStore<Partial<OtherProcessed>>({});

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

export const otherProcessedApi = createApi($otherProcessed, {
    addNewInserts: (state, newInserts: any[]) => ({ ...state, newInserts }),
    addUpdates: (state, updates: any[]) => ({ ...state, updates }),
});

export const $programStageUniqueElements = $programStageMapping.map(
    (programStageMapping) => programStageUniqElements(programStageMapping)
);

export const $programStageUniqueColumns = $programStageMapping.map(
    (programStageMapping) => programStageUniqColumns(programStageMapping)
);

export const $programUniqAttributes = $attributeMapping.map(
    (attributeMapping) => programUniqAttributes(attributeMapping)
);

export const $mandatoryAttribute = $attributeMapping.map((attributeMapping) =>
    mandatoryAttributes(attributeMapping)
);

export const $programUniqColumns = $attributeMapping.map((attributeMapping) =>
    programUniqColumns(attributeMapping)
);

export const $label = combine(
    $steps,
    $programMapping,
    (step, programMapping) => {
        return label(step, programMapping);
    }
);

export const $canDHIS2 = $programMapping.map((state) => canQueryDHIS2(state));

export const $remoteAPI = $programMapping.map((state) =>
    makeRemoteApi(state.authentication)
);
export const $remoteOrganisationApi = $programMapping.map((state) => {
    const axiosApi = makeRemoteApi(state.orgUnitApiAuthentication);
    return axiosApi;
});

export const $metadataAuthApi = $programMapping.map((state) =>
    makeRemoteApi(state.metadataApiAuthentication)
);
export const $dhis2Program = domain.createStore<Partial<IProgram>>({});

export const dhis2ProgramApi = createApi($dhis2Program, {
    set: (_, data: Partial<IProgram>) => data,
});

export const $programTypes = $program.map((state) => makeValidation(state));
export const $goData = domain.createStore<Partial<IGoData>>({});

export const goDataApi = createApi($goData, {
    set: (_, data: Partial<IGoData>) => data,
});

export const $tokens = domain.createStore<Dictionary<string>>({});
export const tokensApi = createApi($tokens, {
    set: (_, values: Dictionary<string>) => values,
});

export const $metadata = combine(
    $programMapping,
    $program,
    $data,
    $dhis2Program,
    $programStageMapping,
    $attributeMapping,
    $remoteOrganisations,
    $goData,
    $tokens,
    (
        programMapping,
        program,
        data,
        dhis2Program,
        programStageMapping,
        attributeMapping,
        remoteOrganisations,
        goData,
        tokens
    ) =>
        makeMetadata(program, programMapping, {
            data,
            dhis2Program,
            programStageMapping,
            attributeMapping,
            remoteOrganisations,
            goData,
            tokens,
        })
);

export const $disabled = combine(
    $programMapping,
    $steps,
    $programStageMapping,
    $attributeMapping,
    $organisationUnitMapping,
    $metadata,
    (
        programMapping,
        step,
        programStageMapping,
        attributeMapping,
        organisationUnitMapping,
        metadata
    ) =>
        isDisabled(
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            step,
            mySchema,
            metadata.destinationColumns
        )
);
export const $flattenedProgram = $program.map((state) => {
    if (!isEmpty(state)) {
        return flattenProgram(state);
    }
    return [];
});

export const $flattenedProgramKeys = $programMapping.map((state) => {
    if (
        state.metadataOptions?.metadata &&
        state.metadataOptions.metadata.length > 0
    ) {
        return Object.keys(state.metadataOptions.metadata[0]).map((column) => {
            const option: Option = {
                label: column,
                value: column,
            };
            return option;
        });
    }
    return [];
});

export const $token = domain.createStore<string>("");
export const tokenApi = createApi($token, {
    set: (_, token: string) => token,
});

export const $currentOptions = domain.createStore<Option[]>([]);
export const currentOptionsApi = createApi($currentOptions, {
    set: (_, options: Option[]) => options,
});

export const $optionMapping = domain.createStore<Record<string, string>>({});

export const optionMappingApi = createApi($optionMapping, {
    set: (_, value: Record<string, string>) => value,
    add: (state, { key, value }: { key: string; value: string }) => {
        return { ...state, [key]: value };
    },
});

export const $goDataOptions = domain.createStore<GODataOption[]>([]);

export const goDataOptionsApi = createApi($goDataOptions, {
    set: (_, options: GODataOption[]) => options,
});

export const $currentSourceOptions = domain.createStore<Option[]>([]);

export const currentSourceOptionsApi = createApi($currentSourceOptions, {
    set: (_, options: Option[]) => options,
});

export const $errors = domain.createStore<any[]>([]);
export const $conflicts = domain.createStore<any[]>([]);

export const errorsApi = createApi($errors, {
    set: (_, data: any[]) => data,
});
export const conflictsApi = createApi($conflicts, {
    set: (_, data: any[]) => data,
});

export const $names = combine(
    $programMapping,
    $program,
    $goData,
    $dhis2Program,
    (programMapping, program, goData, destinationProgram) => {
        if (
            programMapping.isSource &&
            programMapping.dataSource &&
            ["godata", "dhis2", ""].indexOf(programMapping.dataSource) !== -1
        ) {
            return {
                source: `(${program.name})`,
                destination: `(${goData.name || destinationProgram.name})`,
            };
        } else if (
            programMapping.dataSource &&
            ["godata", "dhis2", ""].indexOf(programMapping.dataSource) !== -1
        ) {
            return {
                destination: `(${program.name})`,
                source: `(${goData.name || destinationProgram.name})`,
            };
        }

        if (programMapping.isSource) {
            return {
                source: `(${program.name})`,
                destination: "",
            };
        }

        return {
            destination: `(${program.name})`,
            source: "",
        };
    }
);
