import { IProgram } from "data-import-wizard-utils";
import Dexie, { Table } from "dexie";

export class DIWDexie extends Dexie {
    program!: Table<Partial<IProgram>>;
    constructor() {
        super("diw");
        this.version(1).stores({});
    }
}

export const db = new DIWDexie();
