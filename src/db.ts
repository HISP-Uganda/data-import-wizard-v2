import { OptionBase } from "chakra-react-select";
import Dexie, { Table } from "dexie";
import { DataNode } from "./Interfaces";

interface Option extends OptionBase {
    label: string;
    value: string;
    id?: string;
}
export class CQIDexie extends Dexie {
    organisations!: Table<DataNode>;
    expandedKeys!: Table<{ id: string; name: string }>;
    levels!: Table<Option>;
    groups!: Table<Option>;

    constructor() {
        super("diw");
        this.version(1).stores({
            organisations: "++id,value,pId,title",
            expandedKeys: "++id,name",
            levels: "++value,label",
            groups: "++value,label",
        });
    }
}

export const db = new CQIDexie();
