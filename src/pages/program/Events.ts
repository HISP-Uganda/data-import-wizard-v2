import {domain} from "../../Domain";
import {IProgram} from "./Interfaces";

export const setIProgramProperty = domain.createEvent<{
    attribute: keyof IProgram,
    value: IProgram[keyof IProgram]
}>();