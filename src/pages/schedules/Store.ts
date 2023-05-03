import { createApi } from "effector";
import { domain } from "../../Domain";
import { ISchedule } from "./Interfaces";
export const $schedules = domain.createStore<Array<Partial<ISchedule>>>([]);

export const scheduleApi = createApi($schedules, {
    add: (state, schedule: Partial<ISchedule>) => {
        return [...state, schedule];
    },
});
