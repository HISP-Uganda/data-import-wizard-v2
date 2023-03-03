export interface ISchedule {
    name: string;
    type: string;
    value: string;
    schedule: string;
    created: string;
    next: string;
    last: string;
    additionalDays: number;
    url: string;
    immediate: boolean;
    upstream: string;
}