import {domain} from "../../Domain";
import {IProgram} from "./Interfaces";
import {setIProgramProperty} from "./Events";

export const $program = domain.createStore<Partial<IProgram>>({

}).on(setIProgramProperty, (state, {attribute, value}) =>{
    return {...state, [attribute]: value }
});