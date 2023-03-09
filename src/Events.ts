import { domain } from "./Domain";
import {
    IMapping,
    ICategoryOption,
    ICategoryCombo,
    ICategory,
} from "./Interfaces";
import { ISchedule } from "./pages/schedules/Interfaces";
import { IProgram } from "./pages/program/Interfaces";
import { IDataSet } from "./pages/aggregate/Interfaces";

export const loadDefaults = domain.createEvent<{
    mappings: string[];
    schedules: string[];
    aggregates: string[];
}>();
export const setDialogOpen = domain.createEvent<boolean>();
export const setTotalDataSets = domain.createEvent<number>();
export const setTotalPrograms = domain.createEvent<number>();
export const openDialog = domain.createEvent();
export const closeDialog = domain.createEvent();
export const setScheduled = domain.createEvent();
export const setCurrentSchedule = domain.createEvent<ISchedule>();
export const setNextAggregateStep = domain.createEvent<number>();
export const setNext = domain.createEvent<void>();
export const setPrevious = domain.createEvent<void>();
export const setStep = domain.createEvent<number>();
export const setOpen = domain.createEvent<boolean>();
export const createSchedule = domain.createEvent<ISchedule>();
export const handleDrawerOpen = domain.createEvent<boolean>();
export const handleDrawerClose = domain.createEvent<boolean>();
export const saveSchedules = domain.createEvent<ISchedule[]>();
export const saveSchedule = domain.createEvent<ISchedule>();
export const updateSchedule = domain.createEvent<ISchedule>();
export const startSchedule = domain.createEvent<string>();
export const deleteSchedule = domain.createEvent<ISchedule>();

export const setPrograms = domain.createEvent<IProgram[]>();
export const setDataSets = domain.createEvent<IDataSet[]>();
export const setDataSet = domain.createEvent<IDataSet>();
export const setSearch = domain.createEvent<string>();
export const setMappings = domain.createEvent<IMapping[]>();
// export const setSchedules = domain.createEvent<>();
// export const setAggregate = domain.createEvent<>();
// export const setAggregates = domain.createEvent<>();
// export const setLoading = domain.createEvent<>();
// export const setUpload = domain.createEvent<>();
// export const setImportData = domain.createEvent<>();
// export const setProgram = domain.createEvent<>();
// export const setPaging = domain.createEvent<>();

export const changeElementPage = domain.createEvent<string>();

// Category Events
export const setCategoryProperty = domain.createEvent<{
    attribute: keyof ICategory;
    value: ICategory[keyof ICategory]; // this references all value types in Category
}>();
export const setCategoryMapping = domain.createEvent<IMapping>();
export const setCategoryOptions = domain.createEvent<ICategoryOption[]>();

// CategoryCombo Events
export const setCategoryComboProperty = domain.createEvent<{
    attribute: keyof ICategoryCombo;
    value: ICategoryCombo[keyof ICategoryCombo];
}>();
export const setCategoryComboOptions = domain.createEvent<ICategoryOption[]>();

// CategoryOptionCombo Events
