import Dexie, { Table } from "dexie";
import { IProgram } from "./pages/program/Interfaces";

export class DIWDexie extends Dexie {
    program!: Table<Partial<IProgram>>;
    constructor() {
        super("diw");
        this.version(1).stores({});
    }
}

export const db = new DIWDexie();
