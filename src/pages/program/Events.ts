import { domain } from "../../Domain";
import { IProgram, IProgramMapping } from "data-import-wizard-utils";

export const setIProgramProperty = domain.createEvent<{
    attribute: keyof IProgram;
    value: IProgram[keyof IProgram];
}>();

export const setMapping = domain.createEvent<Partial<IProgramMapping>>();
export const updateMapping = domain.createEvent<{
    attribute: keyof IProgramMapping;
    value: IProgramMapping[keyof IProgramMapping];
}>();

export const changeData = domain.createEvent<any[]>();

export const updateOUMapping = domain.createEvent<{
    attribute: string;
    value: any;
}>();

export const updateAttributeMapping = domain.createEvent<{
    attribute: string;
    value: any;
}>();

export const updateProgramStageMapping = domain.createEvent<{
    stage: string;
    attribute: string;
    value: any;
}>();

export const setProgram = domain.createEvent<Partial<IProgram>>();
