import { createApi } from "effector";
import { domain } from "./Domain";

export const $steps = domain.createStore<number>(0);
export const $version = domain.createStore<number>(0);

export const stepper = createApi($steps, {
    next: (state) => state + 1,
    previous: (state) => state - 1,
    goTo: (_, step: number) => step,
    reset: () => 0,
});
export const versionApi = createApi($version, {
    set: (_, value: number) => value,
});

export const $action = domain.createStore<"creating" | "editing">("creating");

export const actionApi = createApi($action, {
    edit: () => "editing",
    create: () => "creating",
});
