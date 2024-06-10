import { OptionBase } from "chakra-react-select";
import { AggConflict } from "data-import-wizard-utils";
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
    dataValueResponses!: Table<{
        id: string;
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
        completed: string;
    }>;
    dataValueConflicts!: Table<AggConflict>;
    trackerResponses!: Table<{
        id: string;
        created: number;
        updated: number;
        ignored: number;
        deleted: number;
        resource: string;
        children: Array<{
            id: string;
            resource: string;
            created: number;
            updated: number;
            ignored: number;
            deleted: number;
            completed: string;
        }>;
        completed: string;
    }>;
    constructor() {
        super("diw");
        this.version(7).stores({
            organisations: "++id,value,pId,title",
            expandedKeys: "++id,name",
            levels: "++value,label",
            groups: "++value,label",
            dataValueResponses: "id,completed",
            trackerResponses: "id,completed",
            dataValueConflicts: "object",
        });
    }
}

export const db = new CQIDexie();
