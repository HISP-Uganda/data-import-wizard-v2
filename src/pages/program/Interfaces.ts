import {
    Enrollment,
    TrackedEntityInstance,
    Update,
} from "data-import-wizard-utils";

export type StageUpdate = Update & { stage: string };

export type Processed = {
    trackedEntities: Array<Partial<TrackedEntityInstance>>;
    enrollments: Array<Partial<Enrollment>>;
    events: Array<Partial<Event>>;
    trackedEntityUpdates: Array<Partial<TrackedEntityInstance>>;
    eventsUpdates: Array<Partial<Event>>;
};

export type OtherProcessed = {
    newInserts: Array<any>;
    updates: Array<any>;
    events: Array<any>;
    labResults: { [key: string]: any };
};
