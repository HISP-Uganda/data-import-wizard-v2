import {
    Authentication,
    canQueryDHIS2,
    findColumns,
    flattenProgram,
    generateUid,
    GODataOption,
    GoResponse,
    IGoData,
    IMapping,
    IProgram,
    isDisabled,
    label,
    makeMetadata,
    makeRemoteApi,
    makeValidation,
    mandatoryAttributes,
    Mapping,
    Option,
    Processed,
    programStageUniqColumns,
    programStageUniqElements,
    programUniqAttributes,
    programUniqColumns,
    StageMapping,
    Step,
} from "data-import-wizard-utils";

import { combine, createApi } from "effector";
import { Dictionary } from "lodash";
import { isEmpty } from "lodash/fp";
import { z } from "zod";
import { domain } from "../../Domain";
import { $hasError, $steps } from "../../Store";
import { OtherProcessed } from "./Interfaces";

const authentication: Partial<Authentication> =
    process.env.NODE_ENV === "development"
        ? {
              basicAuth: true,
              url: process.env.REACT_APP_GO_DATA_URL,
              username: process.env.REACT_APP_GO_DATA_USERNAME,
              password: process.env.REACT_APP_GO_DATA_PASSWORD,
          }
        : {};
export const defaultMapping: Partial<IMapping> = {
    id: generateUid(),
    name: "Example Mapping",
    description: "This an example mapping",
    isSource: false,
    authentication,
    prefetch: true,
    headerRow: 1,
    dataStartRow: 2,
    program: {},
    isCurrentInstance: true,
};
const mySchema = z.string().url();

export const $attributeMapping = domain.createStore<Mapping>({});
export const $remoteMapping = domain.createStore<Mapping>({});
export const $remoteOrganisations = domain.createStore<any[]>([]);
export const $programStageMapping = domain.createStore<StageMapping>({});
export const $organisationUnitMapping = domain.createStore<Mapping>({});

export const $data = domain.createStore<any[]>([]);

export const $programMapping =
    domain.createStore<Partial<IMapping>>(defaultMapping);

export const $columns = $data.map((state) => findColumns(state));

export const $program = domain.createStore<Partial<IProgram>>({});

export const $processed = domain.createStore<Partial<Processed>>({});
export const $otherProcessed = domain.createStore<Partial<OtherProcessed>>({});
export const $prevGoData = domain.createStore<Dictionary<string>>({});
export const $processedGoDataData = domain.createStore<
    Partial<{
        errors: GoResponse;
        conflicts: GoResponse;
        processed: { updates: GoResponse; inserts: GoResponse };
    }>
>({});

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
    makeRemoteApi(state.program?.metadataApiAuthentication)
);
export const $dhis2Program = domain.createStore<Partial<IProgram>>({});

export const $programTypes = $program.map((state) => makeValidation(state));
export const $goData = domain.createStore<Partial<IGoData>>({});

export const $tokens = domain.createStore<Dictionary<string>>({});
export const $activeSteps = domain.createStore<Step[]>([]);
export const $token = domain.createStore<string>("");

export const $currentOptions = domain.createStore<Option[]>([]);

export const $optionMapping = domain.createStore<Record<string, string>>({});
export const $currentSourceOptions = domain.createStore<Option[]>([]);

export const $errors = domain.createStore<any[]>([]);
export const $conflicts = domain.createStore<any[]>([]);
export const $goDataOptions = domain.createStore<GODataOption[]>([]);
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
    $goDataOptions,
    (
        programMapping,
        program,
        data,
        dhis2Program,
        programStageMapping,
        attributeMapping,
        remoteOrganisations,
        goData,
        tokens,
        referenceData
    ) => {
        return makeMetadata(program, programMapping, {
            data,
            dhis2Program,
            programStageMapping,
            attributeMapping,
            remoteOrganisations,
            goData,
            tokens,
            referenceData,
        });
    }
);

export const $disabled = combine(
    $program,
    $programMapping,
    $activeSteps,
    $steps,
    $programStageMapping,
    $attributeMapping,
    $organisationUnitMapping,
    $metadata,
    $data,
    $hasError,
    (
        program,
        programMapping,
        activeSteps,
        step,
        programStageMapping,
        attributeMapping,
        organisationUnitMapping,
        metadata,
        data,
        hasError
    ) => {
        return isDisabled({
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            step: activeSteps.length > 0 ? activeSteps[step].id : 2,
            mySchema: mySchema as any,
            destinationFields: programMapping.isSource
                ? metadata.destinationColumns
                : metadata.destinationAttributes,
            data,
            program,
            metadata,
            hasError,
        });
    }
);
export const $flattenedProgram = $program.map((state) => {
    if (!isEmpty(state)) {
        return flattenProgram(state);
    }
    return [];
});

export const $flattenedProgramKeys = $programMapping.map((state) => {
    if (
        state.program?.metadataOptions?.metadata &&
        state.program?.metadataOptions.metadata.length > 0
    ) {
        return Object.keys(state.program?.metadataOptions.metadata[0]).map(
            (column) => {
                const option: Option = {
                    label: column,
                    value: column,
                };
                return option;
            }
        );
    }
    return [];
});

export const $names = combine(
    $programMapping,
    $program,
    $goData,
    $dhis2Program,
    (programMapping, program, goData, destinationProgram) => {
        let result: { source: string; destination: string } = {
            source: String(programMapping.dataSource ?? "")
                .split("-")
                .join(" "),
            destination: program.name ?? "",
        };
        if (programMapping.isSource) {
            result.source = program.name || "";
            if (programMapping.dataSource === "dhis2-program") {
                result.destination = destinationProgram.name || "";
            } else if (programMapping.dataSource === "go-data") {
                result.destination = goData.name || "";
            }
        } else {
            result.destination = program.name || "";
            if (programMapping.dataSource === "dhis2-program") {
                result.source = destinationProgram.name || "";
            } else if (programMapping.dataSource === "go-data") {
                result.source = goData.name || "";
            }
        }
        return result;
    }
);

export const $otherName = $programMapping.map((state) => {
    if (state.isSource) return "Destination";
    return "Source";
});

export const $name = $programMapping.map((state) => {
    if (state.isSource) return "Source";
    return "Destination";
});

export const $allNames = $program.map((state) => {
    const names: { [key: string]: string } = {};
    state.programTrackedEntityAttributes?.forEach(
        ({ trackedEntityAttribute: { id, name } }) => {
            names[id] = name;
        }
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
