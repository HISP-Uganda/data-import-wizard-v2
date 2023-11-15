import { MakeGenerics } from "@tanstack/react-location";
import { Event } from "effector";

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
