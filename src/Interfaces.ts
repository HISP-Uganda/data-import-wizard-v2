import { MakeGenerics } from "@tanstack/react-location";
import {generateUid} from "./utils/uid";

export type LocationGenerics =  MakeGenerics<{
    LoaderData: {
    };
    Params: {
    };
    Search: {
    };
  }>;

export interface CommonIdentifier{
    id: string;
    name: string;
    code: string;
}

export  interface Category extends CommonIdentifier{

}

export interface CategoryCombo extends CommonIdentifier{

}

export interface CategoryOption extends CommonIdentifier{

}

export interface CategoryOptionCombo extends CommonIdentifier{
    categoryOptions: CategoryOption[];
}

export interface CategoryCombo extends CommonIdentifier{

}

export interface DataSet extends CommonIdentifier{

}

export interface DataElement extends CommonIdentifier{

}

export interface DataSetElement extends CommonIdentifier{

}

export interface Element extends CommonIdentifier{
    
}

export interface Form {
    name: string;
    categoryOptionCombo: CategoryOptionCombo[];
    dataElements: DataElement[];
    templateType: string;
    
}

export interface Mapping {
    nameColumn: string;
    shortNameColum: string;
    descriptionColumn: string;
    codeColumn: string;
    idColumn: string;
    level: string;
    longitudeColumn: string;
    latitudeColumn: string;
}

export interface Organisation {
    mappings: Mapping[];
    data: any;
    dialogOpen: boolean;
    fileName: string;
    columns: string[];
    message: string;
}

export interface OrganisationUnit extends CommonIdentifier{
    isSelected: boolean;
    mapping: any;
}

export interface Param {
    param: string;
    value: string;
    isPeriod: boolean;
    periodType: string | undefined;
}

export interface Program {
    id: string;
    name: string;
    displayName: string;
    lastUpdated: any;
    programType: string;
    programStages: ProgramStage[];
    categoryCombo: string;
    programTrackedEntityAttributes: any;
    trackedEntityType: any;
    trackedEntity: string;
    mappingId: string;
    isRunning: boolean;
    orgUnitColumn: string;
    orgUnitStrategy: {
        value: "auto";
        label: "auto";
    };
    organisationUnits: OrganisationUnit[];
    headerRow: 1
    dataStartRow: 2
    createNewEnrollments: false;
    createEntities: false;
    updateEntities: false;
    enrollmentDateColumn: string;
    incidentDateColumn: "";
    url: "";
    dateFilter: "";
    dateEndFilter: "";
    lastRun: "";
    uploaded: "";
    uploadMessage: "";
    page: 0;
    rowsPerPage: 5;
    dialogOpen: false;
    orderBy: "mandatory";
    order: "desc";
    attributesFilter: "";

    trackedEntityInstances: [];
    d2;
    fetchingEntities: 0;

    responses: any[];

    increment: 0;

    errors: any[];
    conflicts: any[];
    duplicates: any[];

    longitudeColumn;
    latitudeColumn;

    pulling: false;

    workbook: null;

    selectedSheet: null;

    pulledData: null;

    sheets: any[];

    dataSource: "xlsx";

    scheduleTime: 0;

    percentages: any[];

    total: 0;
    displayProgress: false;

    username: "";
    password: "";
    params: any[];
    responseKey: "";
    fileName;
    mappingName;
    mappingDescription;
    templateType;
    sourceOrganisationUnits: [];
    message: "";
    incidentDateProvided: false;
    processed;
    data: [];
    isUploadingFromPage;

    selectIncidentDatesInFuture;
    selectEnrollmentDatesInFuture;
    isDHIS2: false;
    attributes: true;
    remotePrograms: [];
    remoteProgram: {};
    remoteId: string;

    enrollments: boolean;
    events: false;
    remoteStage: null;
    remoteTrackedEntityTypes: {};
}

export interface ProgramStage {
    id: string;
    name:string;
    displayName: string;
    repeatable: boolean;
    programStageDataElements: ProgramStageDataElement[];
    dataElementsFilter: string;
    page: number;
    rowsPerPage: number;
    orderBy: "compulsory";
    order: "desc";
    eventDateIdentifiesEvent: false;
    completeEvents: false;
    longitudeColumn: string;
    latitudeColumn: string;
    createNewEvents: false;
    updateEvents: boolean;
    eventDateColumn: string;
    eventsByDate: {};
    eventsByDataElement: {};
}

export interface ProgramStageDataElement {
    compulsory: boolean
    dataElement: string
    column: string
    open: false

}

export interface ProgramTrackedEntityAttribute {
    valueType: string;
    mandatory: boolean;
    trackedEntityAttribute: string;
    column: string;
    open: false;
}

export interface Schedule {
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

export interface TrackedEntityAttribute extends CommonIdentifier{
    displayName: string;
    optionSet: string;
    optionSetValue: string;
    unique: boolean;
}

export interface IntegrationStore {
    programs: Program[];
    dataSets: DataSet[];
    program: Program;
    dataSet: DataSet;
    trackedEntityInstances: any[];
    error: string;
    activeStep: number;
    activeAggregateStep: number;
    skipped: Set<any>;
    completed: Set<any>;
    completedAggregate: Set<any>;
    steps: string[];
    aggregateSteps: string[];
    totalSteps: number;
    totalAggregateSteps: number;
    multipleCma: any;
    mappings: Mapping[];
    tracker : any;
    dataElements: DataElement[];
    userGroups: string[];
    search: string;
    params: Param[];
    programsFilter: "";
    expanded;
    hasMappingsNameSpace;
    aggregate;
    aggregates: [];
    schedulerEnabled: true;
    organisation: Organisation;
    isFull: true;
    dialogOpen: boolean;
    uploadData: boolean;
    importData: boolean;
    scheduled: boolean;
    schedules: Schedule[];
    currentSchedule: Schedule
    scheduleTypes: {[key: string]: any}[];
    jump: boolean;
    aggregateJump: boolean;
    loading: boolean;
    open: boolean;
    totalDataSets: number;
    totalPrograms: number;
    paging: {[key: string]: any};
    programSchedule: any[];
}