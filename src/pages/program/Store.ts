import { combine } from "effector";
import { z } from "zod";
import { domain } from "../../Domain";
import { $steps } from "../../Store";
import { setIProgramProperty, setMapping, updateMapping } from "./Events";
import { IProgram } from "./Interfaces";

const mySchema = z.string().url();

export const $attributeMapping = domain.createStore({});
export const $programStageMapping = domain.createStore({});

export const $program = domain
    .createStore<Partial<IProgram>>({})
    .on(setMapping, (_, mapping) => mapping)
    .on(setIProgramProperty, (state, { attribute, value }) => {
        return { ...state, [attribute]: value };
    })
    .on(updateMapping, (state, { attribute, value }) => {
        return { ...state, [attribute]: value };
    });

export const $disabled = combine($program, $steps, (program, step) => {
    if (
        program.dataSource === "api" &&
        step === 2 &&
        mySchema.safeParse(program.url).success === false
    ) {
        return true;
    }

    return false;
});
