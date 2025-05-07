import { MakeGenerics } from "@tanstack/react-location";
import { Event } from "effector";
import type { DataNode as IDataNode } from "antd/es/tree";
import { ImportType, Mapping, Option, RealMapping } from "data-import-wizard-utils";

export interface Threshold {
    id: string;
    value: number;
    color: string;
}
export type Column = {
    label: string;
    value: string;
    span: number;
    actual: string;
    position: number;
    key: string;
};
export interface DataNode extends IDataNode {
    id?: string;
    value?: string;
    pId: string;
    children?: DataNode[];
    type?: string;
    nodeSource?: { [key: string]: any };
    hasChildren?: boolean;
    bg?: string;
    actual?: string;
    parent?: { [key: string]: any };
    order?: string;
    metadata?: Partial<{
        rows: number;
        columns: number;
        rowsPerPage: number;
    }>;
    filter?: string;
}

export type LocationGenerics = MakeGenerics<{
    LoaderData: {};
    Params: {};
    Search: { type: ImportType };
}>;

export type AttributeProps<T> = {
    title: string;
    attribute: keyof T;
    obj: T;
    func: Event<{ attribute: keyof T; value: any; key?: string }>;
    direction?: "row" | "column";
};

export type MappingUpdate = {
    attribute: string;
    update: Partial<RealMapping>;
    stage?: string;
};

export type Merger = { mapping: Mapping; stage?: string };
