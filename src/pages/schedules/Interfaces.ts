export interface ISchedule {
    id: string;
    name: string;
    type: string;
    schedule: string;
    created: string;
    nextRun: string;
    lastRun: string;
    additionalDays: number;
    schedulingSeverURL: string;
    immediate: boolean;
    upstream: string;
    mapping: string;
}
