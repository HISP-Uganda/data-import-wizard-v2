import { Option, Period } from "data-import-wizard-utils";
import { createApi } from "effector";
import { WorkBook } from "xlsx";
import { domain } from "./Domain";

export const $periods = domain.createStore<Period[]>([]);
export const $ous = domain.createStore<string[]>([]);

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

export const $workbook = domain.createStore<WorkBook | null>(null);

export const workbookApi = createApi($workbook, {
    set: (_, workbook: WorkBook) => workbook,
    reset: () => null,
});

export const $sheets = $workbook.map<Option[]>((workbook) => {
    if (workbook) {
        return workbook.SheetNames.map((s) => ({ label: s, value: s }));
    }
    return [];
});

export const periodsApi = createApi($periods, {
    set: (_, { periods, remove }: { periods: Period[]; remove: boolean }) =>
        periods,
});
export const ousApi = createApi($ous, {
    set: (_, ous: string[]) => ous,
});
