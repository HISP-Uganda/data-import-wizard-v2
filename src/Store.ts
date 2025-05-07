import {
    AggDataValue,
    canQueryDHIS2,
    findColumns,
    flattenProgram,
    getMandatoryAttributes,
    getProgramStageUniqColumns,
    getProgramStageUniqElements,
    GODataOption,
    IDataSet,
    IGoData,
    IMapping,
    IProgram,
    label,
    makeMetadata,
    makeProgramTypes,
    makeRemoteApi,
    Mapping,
    Option,
    Period,
    Processed,
    StageMapping,
    Step,
} from "data-import-wizard-utils";
import { combine, createApi } from "effector";
import { Dictionary, isEmpty } from "lodash";
import { WorkBook } from "xlsx";
import { domain } from "./Domain";

export const $mapping = domain.createStore<Partial<IMapping>>({});
export const $data = domain.createStore<any[]>([]);
export const $periods = domain.createStore<Period[]>([]);
export const $ous = domain.createStore<string[]>([]);

export const $steps = domain.createStore<number>(0);
export const $version = domain.createStore<number>(0);
export const $hasError = domain.createStore<boolean>(false);
export const $excel = domain.createStore<any[]>([]);

export const stepper = createApi($steps, {
    next: (state) => state + 1,
    previous: (state) => state - 1,
    goTo: (_, step: number) => step,
    reset: () => 0,
});
export const versionApi = createApi($version, {
    set: (_, value: number) => value,
});

export const $action = domain.createStore<"creating" | "editing">("creating");

export const actionApi = createApi($action, {
    edit: () => "editing",
    create: () => "creating",
});

export const $workbook = domain.createStore<WorkBook | null>(null);

export const $fhir = domain.createStore<{
    concepts: any[];
    labelColumn: string;
    valueColumn: string;
}>({ concepts: [], labelColumn: "", valueColumn: "" });

export const workbookApi = createApi($workbook, {
    set: (_, workbook: WorkBook) => workbook,
    reset: () => null,
});

export const $sheets = $workbook.map<Option[]>((workbook) => {
    if (workbook) {
        return workbook.SheetNames.map((s) => ({ label: s, value: s }));
    }
    return [];
});

export const periodsApi = createApi($periods, {
    set: (_, { periods, remove }: { periods: Period[]; remove: boolean }) =>
        periods,
});
export const ousApi = createApi($ous, {
    set: (_, ous: string[]) => ous,
});
export const hasErrorApi = createApi($hasError, {
    set: (_, hasError: boolean) => hasError,
});

export const $label = combine($steps, $mapping, (step, programMapping) => {
    return label(step, programMapping);
});

export const $dataSet = domain.createStore<Partial<IDataSet>>({});
export const $dhis2DataSet = domain.createStore<Partial<IDataSet>>({});
export const $programIndicators = domain.createStore<Option[]>([]);
export const $indicators = domain.createStore<Option[]>([]);
export const $attributionMapping = domain.createStore<Mapping>(new Map());

export const $otherName = $mapping.map((state) => {
    if (state.isSource) return "Destination";
    return "Source";
});

export const $processedData = domain.createStore<AggDataValue[]>([]);
export const $invalidData = domain.createStore<any[]>([]);

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

export const $configList = $mapping.map((state) => {
    if (state.dataSource) {
        if (state.useColumnLetters) {
            return all[state.dataSource]?.filter((x) => x !== "header-row");
        }
        return all[state.dataSource] || [];
    }
    return [];
});

export const $attributeMapping = domain.createStore<Mapping>(new Map());
export const $enrollmentMapping = domain.createStore<Mapping>(new Map());
export const $remoteMapping = domain.createStore<Mapping>(new Map());
export const $remoteOrganisations = domain.createStore<any[]>([]);
export const $programStageMapping = domain.createStore<StageMapping>(new Map());
export const $organisationUnitMapping = domain.createStore<Mapping>(new Map());

export const $columns = $data.map((state) => findColumns(state));

export const $program = domain.createStore<Partial<IProgram>>({});

export const $processed = domain.createStore<Processed>({
    goData: {
        conflicts: {
            epidemiology: [],
            events: [],
            lab: [],
            person: [],
            questionnaire: [],
            relationships: [],
        },
        errors: {
            epidemiology: [],
            events: [],
            lab: [],
            person: [],
            questionnaire: [],
            relationships: [],
        },
        inserts: {
            epidemiology: [],
            events: [],
            lab: [],
            person: [],
            questionnaire: [],
            relationships: [],
        },
        updates: {
            epidemiology: [],
            events: [],
            lab: [],
            person: [],
            questionnaire: [],
            relationships: [],
        },
    },
    dhis2: {
        trackedEntityInstances: [],
        trackedEntityInstanceUpdates: [],
        enrollments: [],
        events: [],
        enrollmentUpdates: [],
        eventUpdates: [],
        errors: [],
        conflicts: [],
    },
    processedData: [],
});
export const $prevGoData = domain.createStore<Map<string, string>>(new Map());

export const $programStageUniqueElements = combine(
    { programStageMapping: $programStageMapping, mapping: $mapping },
    ({ programStageMapping, mapping }) => {
        return getProgramStageUniqElements(
            mapping.eventStageMapping ?? new Map(),
            programStageMapping,
        );
    },
);

export const $programStageUniqueColumns = combine(
    { programStageMapping: $programStageMapping, mapping: $mapping },
    ({ programStageMapping, mapping }) =>
        getProgramStageUniqColumns(
            mapping.eventStageMapping ?? new Map(),
            programStageMapping,
        ),
);

export const $mandatoryAttribute = $attributeMapping.map((attributeMapping) =>
    getMandatoryAttributes(attributeMapping),
);

export const $canDHIS2 = $mapping.map((state) => canQueryDHIS2(state));

export const $remoteAPI = $mapping.map((state) =>
    makeRemoteApi(state.authentication),
);
export const $remoteOrganisationApi = $mapping.map((state) => {
    const axiosApi = makeRemoteApi(state.orgUnitApiAuthentication);
    return axiosApi;
});

export const $metadataAuthApi = $mapping.map((state) =>
    makeRemoteApi(state.program?.metadataApiAuthentication),
);
export const $dhis2Program = domain.createStore<Partial<IProgram>>({});

export const $programTypes = $program.map((state) => makeProgramTypes(state));
export const $goData = domain.createStore<Partial<IGoData>>({});

export const $tokens = domain.createStore<Map<string, string>>(new Map());
export const $activeSteps = domain.createStore<Step[]>([]);
export const $token = domain.createStore<string>("");

export const $currentOptions = domain.createStore<Option[]>([]);

export const $optionMapping = domain.createStore<Map<string, string>>(
    new Map(),
);
export const $currentSourceOptions = domain.createStore<Option[]>([]);

export const $errors = domain.createStore<any[]>([]);
export const $conflicts = domain.createStore<any[]>([]);
export const $goDataOptions = domain.createStore<GODataOption[]>([]);
export const $metadata = combine(
    {
        mapping: $mapping,
        program: $program,
        data: $data,
        dhis2Program: $dhis2Program,
        remoteOrganisations: $remoteOrganisations,
        goData: $goData,
        tokens: $tokens,
        goDataOptions: $goDataOptions,
        dataSet: $dataSet,
        dhis2DataSet: $dhis2DataSet,
        programIndicators: $programIndicators,
        indicators: $indicators,

        attributeMapping: $attributeMapping,
        enrollmentMapping: $enrollmentMapping,
        programStageMapping: $programStageMapping,
        organisationUnitMapping: $organisationUnitMapping,
        fhir: $fhir,
    },
    ({
        mapping,
        program,
        data,
        dhis2Program,
        remoteOrganisations,
        goData,
        tokens,
        goDataOptions,
        dataSet,
        dhis2DataSet,
        programIndicators,
        indicators,
        fhir,
        enrollmentMapping,
        programStageMapping,
        attributeMapping,
        organisationUnitMapping,
    }) => {
        return makeMetadata({
            program,
            mapping,
            data,
            dhis2Program,
            remoteOrganisations,
            goData,
            tokens,
            referenceData: goDataOptions,
            dhis2DataSet,
            dataSet,
            indicators,
            programIndicators,
            previous: {
                enrollmentMapping,
                programStageMapping,
                attributeMapping,
                organisationUnitMapping,
            },
            fhir,
        });
    },
);

export const $disabled = combine(
    {
        program: $program,
        mapping: $mapping,
        activeSteps: $activeSteps,
        steps: $steps,
        programStageMapping: $programStageMapping,
        attributeMapping: $attributeMapping,
        organisationUnitMapping: $organisationUnitMapping,
        enrollmentMapping: $enrollmentMapping,
        metadata: $metadata,
        data: $data,
        hasError: $hasError,
    },
    ({
        program,
        mapping,
        activeSteps,
        steps,
        programStageMapping,
        attributeMapping,
        enrollmentMapping,
        organisationUnitMapping,
        metadata,
        data,
        hasError,
    }) => {
        // if (mapping.type === "aggregate") return false;
        // return makeValidation({
        //     mapping,
        //     programStageMapping,
        //     attributeMapping,
        //     organisationUnitMapping,
        //     step: activeSteps.length > 0 ? activeSteps[steps].id : 2,
        //     mySchema: mySchema as any,
        //     data,
        //     program,
        //     metadata,
        //     hasError,
        //     enrollmentMapping,
        // });
        return false;
    },
);
export const $flattenedProgram = $program.map((state) => {
    if (!isEmpty(state)) {
        return flattenProgram(state);
    }
    return [];
});

export const $flattenedProgramKeys = $mapping.map((state) => {
    if (
        state.program?.metadataOptions?.metadata &&
        state.program?.metadataOptions?.metadata.length > 0
    ) {
        return Object.keys(state.program?.metadataOptions?.metadata[0]).map(
            (column) => {
                const option: Option = {
                    label: column,
                    value: column,
                };
                return option;
            },
        );
    }
    return [];
});

export const $names = combine(
    $mapping,
    $program,
    $dataSet,
    $goData,
    $dhis2Program,
    $dhis2DataSet,
    (
        mapping,
        program,
        dataSet,
        goData,
        destinationProgram,
        destinationDataSet,
    ) => {
        let result: { source: string; destination: string } = {
            source: String(mapping.dataSource ?? "")
                .split("-")
                .join(" "),
            destination: "",
        };
        if (mapping.type === "aggregate") {
            result.destination = dataSet.name ?? "";
            if (mapping.isSource) {
                result.source = dataSet.name || "";
                if (mapping.dataSource === "dhis2-data-set") {
                    result.destination = destinationDataSet.name || "";
                }
            } else {
                result.destination = dataSet.name || "";
                if (mapping.dataSource === "dhis2-data-set") {
                    result.source = destinationDataSet.name || "";
                }
            }
        } else if (mapping.type === "individual") {
            result.destination = program.name ?? "";
            if (mapping.isSource) {
                result.source = program.name || "";
                if (mapping.dataSource === "dhis2-program") {
                    result.destination = destinationProgram.name || "";
                } else if (mapping.dataSource === "go-data") {
                    result.destination = goData.name || "";
                }
            } else {
                result.destination = program.name || "";
                if (mapping.dataSource === "dhis2-program") {
                    result.source = destinationProgram.name || "";
                } else if (mapping.dataSource === "go-data") {
                    result.source = goData.name || "";
                }
            }
        }
        return result;
    },
);

export const $name = $mapping.map((state) => {
    if (state.isSource) return "Source";
    return "Destination";
});

export const $allNames = $program.map((state) => {
    const names: { [key: string]: string } = {};
    state.programTrackedEntityAttributes?.forEach(
        ({ trackedEntityAttribute: { id, name } }) => {
            names[id] = name;
        },
    );
    state.programStages?.forEach(({ programStageDataElements, id, name }) => {
        names[id] = name;
        programStageDataElements.forEach(({ dataElement: { id, name } }) => {
            names[id] = name;
        });
    });
    state.organisationUnits?.forEach(({ id, name }) => {
        names[id] = name;
    });
    return names;
});

export const $additionalParams = $mapping.map((mapping) => {
    let additionalParams = {};
    if (mapping.dhis2SourceOptions?.ous) {
        additionalParams = {
            ...additionalParams,
            ou: mapping.dhis2SourceOptions.ous,
        };
    }

    if (
        mapping.dhis2SourceOptions &&
        mapping.dhis2SourceOptions.period &&
        mapping.dhis2SourceOptions.period.length > 0 &&
        mapping.dhis2SourceOptions.period[0].startDate &&
        mapping.dhis2SourceOptions.period[0].endDate &&
        mapping.dhis2SourceOptions.searchPeriod === "enrollmentDate"
    ) {
        const programStartDate = mapping.dhis2SourceOptions.period[0].startDate;
        const programEndDate = mapping.dhis2SourceOptions.period[0].endDate;

        additionalParams = {
            ...additionalParams,
            programEndDate,
            programStartDate,
        };
    }
    return additionalParams;
});

export const $conceptColumns = $fhir.map((fhir) => {
    if (fhir.concepts.length > 0) {
        return Object.keys(fhir.concepts[0]);
    }
    return [];
});
