import { domain } from "../Domain";
import { IProgram } from "../Interfaces";

export const $program = domain.createStore<Partial<IProgram>>({});
