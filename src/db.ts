import { OptionBase } from "chakra-react-select";
import { AggConflict, Option } from "data-import-wizard-utils";
import Dexie, { Table } from "dexie";
import { DataNode } from "./Interfaces";

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
    dataValueErrors!: Table<AggConflict>;
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
    organisationMapping!: Table<Partial<Option>>;
    attributeMapping!: Table<Partial<Option>>;
    attributionMapping!: Table<Partial<Option>>;
    optionsMapping!: Table<Partial<Option>>;
    enrollmentMapping!: Table<Partial<Option>>;
    programStageMapping!: Table<Partial<Option>>;
    messages!: Table<{ id: number; message: string }>;
    constructor() {
        super("diw");
        this.version(1).stores({
            organisations: "value",
            expandedKeys: "id,name",
            levels: "value,label,xxx",
            groups: "value,label",
            dataValueResponses: "id,completed",
            trackerResponses: "id,completed",
            dataValueConflicts: "uid",
            dataValueErrors: "uid",
            organisationMapping: "value",
            attributeMapping: "value",
            optionsMapping: "value",
            attributionMapping: "value",
            enrollmentMapping: "value",
            programStageMapping: "[stage+value],stage,value",
            messages: "++id",
        });
    }
}

export async function initializeDatabase() {
    const db = new CQIDexie();

    try {
        await db.open();
        return db;
    } catch (error) {
        if (error instanceof Dexie.VersionError) {
            console.error("VersionError:", error.inner.name);
            if (error.inner?.name === "NoSuchDatabaseError") {
                console.log("Database doesn't exist, creating it...");
                await db.delete();
                await db.open();
                return db;
            } else if (error.inner?.name === "VersionError") {
                await db.delete();
                await db.open();
                return db;
            } else {
                console.log("Forcing upgrade...");
                db.close();
                const newDb = new CQIDexie();
                await newDb.open();
                return newDb;
            }
        } else if (error instanceof Dexie.DexieError) {
            console.error("Other Dexie error:", error.message);
        } else {
            console.error("Unknown error:");
        }
        throw error;
    }
}
