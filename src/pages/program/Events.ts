import { domain } from "../../Domain";
import { IMapping } from "../../Interfaces";
import { IProgram } from "./Interfaces";

export const setIProgramProperty = domain.createEvent<{
    attribute: keyof IProgram;
    value: IProgram[keyof IProgram];
}>();

export const setMapping = domain.createEvent<Partial<IProgram>>();
export const updateMapping = domain.createEvent<{
    attribute: keyof IProgram;
    value: IProgram[keyof IProgram];
}>();
