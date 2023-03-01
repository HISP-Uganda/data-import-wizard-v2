import { domain } from "./Domain";
import {
     Schedule,
     Mapping,
     Program,
     DataSet,
     CategoryOption,
     CategoryCombo,
     Category
} from "./Interfaces"
import aggregate from "./components/Aggregate";

export const loadDefaults = domain.createEvent<{
     mappings: string[], schedules: string[], aggregates:  string[]}>();
export const setDialogOpen = domain.createEvent<boolean>();
export const setTotalDataSets = domain.createEvent<number>();
export const setTotalPrograms = domain.createEvent<number>();
export const openDialog = domain.createEvent();
export const closeDialog = domain.createEvent();
export const setScheduled = domain.createEvent();
export const setCurrentSchedule = domain.createEvent<Schedule>();
export const setNextAggregateStep = domain.createEvent<number>();
export const setNext = domain.createEvent<number>();
export const setOpen = domain.createEvent<boolean>();
export const createSchedule = domain.createEvent<Schedule>();
export const handleDrawerOpen = domain.createEvent<boolean>();
export const handleDrawerClose = domain.createEvent<boolean>();
export const saveSchedules = domain.createEvent<Schedule[]>();
export const saveSchedule = domain.createEvent<Schedule>();
export const updateSchedule = domain.createEvent<Schedule>();
export const startSchedule = domain.createEvent<string>();
export const deleteSchedule = domain.createEvent<Schedule>();

export const setPrograms = domain.createEvent<Program[]>();
export const setDataSets = domain.createEvent<DataSet[]>();
export const setDataSet = domain.createEvent<DataSet>();
export const setSearch = domain.createEvent<string>();
export const setMappings = domain.createEvent<Mapping[]>();
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
     attribute: keyof Category;
     value: Category[keyof Category] // this references all value types in Category
}>();
export const setCategoryMapping = domain.createEvent<Mapping>();
export const setCategoryOptions = domain.createEvent<CategoryOption[]>();

// CategoryCombo Events
export const setCategoryComboProperty = domain.createEvent<{
     attribute: keyof CategoryCombo,
     value: CategoryCombo[keyof CategoryCombo]
}>();
export const setCategoryComboOptions = domain.createEvent<CategoryOption[]>();

// CategoryOptionCombo Events
