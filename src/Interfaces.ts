import { MakeGenerics } from "@tanstack/react-location";
import { Event } from "effector";
import type { DataNode as IDataNode } from "antd/es/tree";

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
    Search: {};
}>;

export type AttributeProps<T> = {
    title: string;
    attribute: keyof T;
    obj: T;
    func: Event<{ attribute: keyof T; value: any; key?: string }>;
    direction?: "row" | "column";
};
