// import { combine } from "effector";
import { domain } from "../Domain";
import {
    IntegrationStore,
    Organisation,
    Schedule
} from "../Interfaces";
import {
    closeDialog,
    openDialog,
    setScheduled,
    setDialogOpen,
    setTotalDataSets,
    setTotalPrograms,
    setCurrentSchedule,
    setNextAggregateStep,
    setNext,
    setOpen,
    createSchedule,
    handleDrawerOpen,
    handleDrawerClose,
    saveSchedules,
    saveSchedule,
    updateSchedule,
    startSchedule,
    deleteSchedule,
    setPrograms, changeElementPage
} from "../Events";
import {usePrograms} from "../Queries";

export const $store = domain.createStore({
    // put some default states here
});

export const createOrganisation = ():Organisation =>{
    return {
        mappings:[],
        data: [],
        dialogOpen: false,
        fileName: "",
        columns: [],
        message: ""
    };
}

export const createNewSchedule = ():Schedule =>{
    return {
        name: "",
        type: "",
        value: "",
        schedule: "",
        created: "",
        next: "",
        last: "",
        additionalDays: 0,
        url: "",
        immediate: false,
        upstream: ""
    };
}
export const $iStore = domain.createStore<IntegrationStore>({
    programs: [],
    dataSets: [],
    program: "",
    dataSet: "",
    trackedEntityInstances: [],
    error: "",
    activeStep: 0,
    activeAggregateStep: 0,
    skipped: new Set(),
    completed: new Set(),
    completedAggregate: new Set(),
    steps: [
        "SAVED MAPPINGS",
        "SELECT PROGRAM",
        "IMPORT TYPE",
        "DATA OPTIONS",
        "MAP PROGRAM ATTRIBUTES",
        "MAP PROGRAM STAGES",
        "IMPORT DATA",
        "IMPORT SUMMARY",
    ],
    aggregateSteps: [
        "SAVED MAPPINGS",
        "SELECT DATA SET",
        "IMPORT TYPE",
        "IMPORT OPTIONS",
        "DATA SET MAPPING",
        "IMPORT DATA",
        "IMPORT SUMMARY",
    ],
    totalSteps: 8,
    totalAggregateSteps: 7,
    multipleCma: {},
    mappings: [],
    tracker: "",
    dataElements: [],
    userGroups: [],
    search: "",
    params: [],
    programsFilter: "",
    expanded: "",
    hasMappingsNameSpace: false,

    aggregate: false,
    aggregates: [],
    schedulerEnabled: false,
    organisation: createOrganisation(),
    isFull: false,
    dialogOpen: false,
    uploadData: false,
    importData: false,
    scheduled: false,
    schedules: [],
    currentSchedule: createNewSchedule(),
    scheduleTypes: [
        {
            value: "Second",
            label: "Second",
        },
        {
            value: "Minute",
            label: "Minute",
        },
        {
            value: "Hour",
            label: "Hour",
        },
    ],
    jump: false,
    aggregateJump: false,
    loading: false,
    open: false,
    totalDataSets: 0,
    totalPrograms: 0,
    paging: {
        d1: {
            page: 0,
            rowsPerPage: 10,
        },
        d2: {
            page: 0,
            rowsPerPage: 10,
        },
        d3: {
            page: 0,
            rowsPerPage: 10,
        },

        step1: {
            page: 0,
            rowsPerPage: 10,
        },
        d25: {
            page: 0,
            rowsPerPage: 5,
        },
        step25: {
            page: 0,
            rowsPerPage: 5,
        },
        dataSets: {
            page: 0,
            rowsPerPage: 10,
        },
        remote: {
            page: 0,
            rowsPerPage: 5,
        },
    },
    programSchedule: [],

}).on(setDialogOpen, (state, dialogOpen) => {
    return {...state, dialogOpen};
} ).on(setTotalDataSets, (state, totalDataSets) => {
    return {...state, totalDataSets};
}).on(setTotalPrograms, (state, totalPrograms) => {
    return {...state, totalPrograms}
}).on(openDialog, (state) => {
    return {...state, dialogOpen: true};
}).on(closeDialog, (state) => {
    return {...state, dialogOpen: false};
}).on(setScheduled, (state) =>{
    return {...state, scheduled:true};
}).on(setCurrentSchedule, (state,currentSchedule) => {
    return {...state, currentSchedule};
}).on(setNextAggregateStep, ()=>{

}).on(setNext, ()=>{

}).on(setOpen, ()=>{

}).on(createSchedule, (state)=>{
    const sched = createNewSchedule();
    return {...state, currentSchedule: sched, scheduled: true}
}).on(handleDrawerOpen, ()=>{

}).on(handleDrawerClose, ()=>{

}).on(saveSchedule, (state, schedule)=>{
    return {...state}
}).on(saveSchedules, ()=>{

}).on(updateSchedule, (state,currentSchedule)=>{
    return {...state, currentSchedule, scheduled: true};
}).on(startSchedule, ()=>{

}).on(deleteSchedule, ()=>{

}).on(setPrograms, (state, programs)=>{
    return{...state, programs}

}).on(changeElementPage, (state, what) =>{
    const current = state.paging[what];
    // const change = {};
    // if (current) {
    //     change.page = page;
    //     change.rowsPerPage = current.rowsPerPage;
    //     const data = _.fromPairs([[what, change]]);
    //
    //     const p = {
    //         ...this.paging,
    //         ...data,
    //     };
    //     this.setPaging(p);
    //     switch (what) {
    //         case "d1":
    //             await this.fetchDataSets();
    //             break;
    //         case "step1":
    //             await this.fetchPrograms();
    //             break;
    //         default:
    //         // console.log('Nothing to do');
    //     }
    // }
});