import { combine, createApi } from "effector";
import produce from "immer";
import { fromPairs, getOr, set, uniqBy } from "lodash/fp";
import { z } from "zod";
import { domain } from "../../Domain";
import { Option } from "../../Interfaces";
import { $steps } from "../../Store";
import {
    changeData,
    setMapping,
    setProgram,
    updateAttributeMapping,
    updateMapping,
    updateOUMapping,
    updateProgramStageMapping,
} from "./Events";
import { IProgram, IProgramMapping, Mapping } from "./Interfaces";

const mySchema = z.string().url();
export const $attributeMapping = domain
    .createStore<Mapping>({})
    .on(updateAttributeMapping, (state, { attribute, value }) => {
        return set(attribute, value, state);
    });
export const $programStageMapping = domain
    .createStore<{ [key: string]: Mapping }>({})
    .on(updateProgramStageMapping, (state, { attribute, value, stage }) => {
        return set(`${stage}.${attribute}`, value, state);
    });
export const $organisationUnitMapping = domain
    .createStore<Mapping>({})
    .on(updateOUMapping, (state, { attribute, value }) => {
        return set(attribute, value, state);
    });
export const $data = domain
    .createStore<any[]>([])
    .on(changeData, (_, data) => data);

export const $programMapping = domain
    .createStore<Partial<IProgramMapping>>({})
    .on(setMapping, (_, mapping) => mapping)
    .on(updateMapping, (state, { attribute, value }) => {
        return set(attribute, value, state);
    });

export const $disabled = combine(
    $programMapping,
    $steps,
    (programMapping, step) => {
        if (
            programMapping.dataSource === "api" &&
            step === 2 &&
            mySchema.safeParse(programMapping.authentication?.url).success ===
                false
        ) {
            return true;
        }
        return false;
    }
);

export const $columns = $data.map((state) => {
    if (state.length > 0) {
        return Object.keys(state[0]).map((key) => {
            const option: Option = {
                label: key,
                value: key,
            };
            return option;
        });
    }
    return [];
});

export const $organisationUnits = combine(
    $programMapping,
    $data,
    (programMapping, data) => {
        if (programMapping.orgUnitColumn) {
            return uniqBy(
                "value",
                data.map((d) => {
                    const option: Option = {
                        label: getOr("", programMapping.orgUnitColumn || "", d),
                        value: getOr("", programMapping.orgUnitColumn || "", d),
                    };
                    return option;
                })
            );
        }
        return [];
    }
);

export const $program = domain
    .createStore<Partial<IProgram>>({})
    .on(setProgram, (_, program) => program);

export const $processed = domain.createStore<
    Partial<{
        trackedEntityInstances: any[];
        enrollments: any[];
        events: any[];
    }>
>({});

export const processor = createApi($processed, {
    addInstances: (state, trackedEntityInstances: any[]) =>
        produce(state, (draft) => {
            draft.trackedEntityInstances = trackedEntityInstances;
        }),
    addEnrollments: (state, enrollments: any[]) =>
        produce(state, (draft) => {
            draft.enrollments = enrollments;
        }),
    addEvents: (state, events: any[]) =>
        produce(state, (draft) => {
            draft.events = events;
        }),
    reset: (state) => {
        return { trackedEntityInstances: [] };
    },
});

export const $programStageUniqueColumns = $programStageMapping.map(
    (programStageMapping) => {
        const uniqElements = Object.entries(programStageMapping).map(
            ([stage, mapping]) => {
                const { info, ...elements } = mapping;
                const eventDateIsUnique = info.eventDateIsUnique;
                let uniqueColumns = Object.entries(elements).flatMap(
                    ([element, { unique, value }]) => {
                        if (unique && value) {
                            return element;
                        }
                        return [];
                    }
                );
                if (eventDateIsUnique) {
                    uniqueColumns = [...uniqueColumns, "eventDate"];
                }

                return [stage, uniqueColumns];
            }
        );
        return fromPairs(uniqElements);
    }
);
