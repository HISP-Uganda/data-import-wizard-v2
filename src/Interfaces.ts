import { MakeGenerics } from "@tanstack/react-location";
import { generateUid } from "./utils/uid";

export type LocationGenerics = MakeGenerics<{
    LoaderData: {};
    Params: {};
    Search: {};
}>;

export interface CommonIdentifier {
    id: string;
    name: string;
    code: string;
}

export interface Category extends CommonIdentifier {
    mapping;
    categoryOptions: CategoryOption[];
}

export interface ICategoryCombo extends CommonIdentifier {
    categoryOptionCombos: CategoryOptionCombo[];
    categories: Category[];
}

export interface CategoryOption extends CommonIdentifier {}

export interface CategoryOptionCombo extends CommonIdentifier {
    categoryOptions: CategoryOption[];
    mapping: IMapping;
    dataElement;
    cell;
    column;
}

export interface ICategoryCombo extends CommonIdentifier {}

export interface IDataSet extends CommonIdentifier {
    categoryCombo: string;
    forms;
    aggregateId;
    selectedSheet;
    sheets;
    workbook;
    workSheeet;
    orgUnistColumn;
    periodColumn;
    dataStartColumn;
    orgUnitStrategy;
    organisationUnits;
    periodInExcel;
    organisationUnitInExcel;
    attributeCombosInExcel;
    dataElementColumn;
    categoryOptionComboColumn;
    dataValueColumn;
    headerRow;
    dataStartRow;
    uploadMessage;
    uploaded;
    page;
    rowsPerPage;
    params;
    isDhis2;
    dhis2DataSet;
    dhis2DataSets;
    mapping;
    currentData;
    dataValues;
    periodType;
    period;
    displayProgress;
    displayDhis2Progress;
    organisation;
    organisationColumn;
    periodCell;
    organisationCell;
    url;
    pulledData;
    responses;
    cell2;
    sourceOrganisationUnits;
    filterText;
    pullingErrors;
    username;
    password;
    pulling;
    templateType;
    responseKey;
    dialogOpen;
    levels;
    indicators;
    programIndicators;
    selectedIndicators;
    remoteOrganisations;
    currentLevel;
    selectedDataSet;
    template;
    fileName;
    mappingName;
    mappingDescription;
    completeDataSet;
    multiplePeriods;
    startPeriod;
    endPeriod;
    itemStore;
    assignedItemStore;
    dataElementStore;
    assignedDataElementStore;
    dataIndicators;
    proIndicators;
    dataDataElements;
    message;
    scheduleServerUrl;
    useProxy;
    proxy;
    processed;
    isUploadingFromPage;
    dialogOpened;
    selectedPeriods;
    action;
    showOnlyUnmappedUnits;
    unitsFilter;
}

export interface IDataElement extends CommonIdentifier {
    displayName: string;
    valueType: string;
    optionSet;
}

export interface IDataSetElement extends CommonIdentifier {
    open: boolean;
    dataElement: IDataElement;
}

export interface IElement extends CommonIdentifier {
    categoryCombo: ICategoryCombo;
    valueType: string;
    mapping: IMapping;
    uniqueCategoryOptionCombos;
}

export interface Form {
    name: string;
    categoryOptionCombo: CategoryOptionCombo[];
    dataElements: IDataElement[];
    templateType: string;
}

export interface IMapping {
    nameColumn: string;
    shortNameColum: string;
    descriptionColumn: string;
    codeColumn: string;
    idColumn: string;
    level: string;
    longitudeColumn: string;
    latitudeColumn: string;
}

export interface IOption {
    code: string;
    name: string;
    value: string;
}

export interface OptionSet {
    options: IOption[];
}

export interface Organisation {
    mappings: IMapping[];
    data: any;
    dialogOpen: boolean;
    fileName: string;
    columns: string[];
    message: string;
}

export interface IOrganisationUnit extends CommonIdentifier {
    isSelected: boolean;
    mapping: any;
}

export interface IParam {
    param: string;
    value: string;
    isPeriod: boolean;
    periodType: string | undefined;
}

export interface IProgram {
    id: string;
    name: string;
    displayName: string;
    lastUpdated: any;
    programType: string;
    programStages: IProgramStage[];
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
    organisationUnits: IOrganisationUnit[];
    headerRow: 1;
    dataStartRow: 2;
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

export interface IProgramStage {
    id: string;
    name: string;
    displayName: string;
    repeatable: boolean;
    programStageDataElements: IProgramStageDataElement[];
    dataElementsFilter: string;
    page: number;
    rowsPerPage: number;
    orderBy: "compulsory";
    order: "asc" | "desc";
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

export interface IProgramStageDataElement {
    compulsory: boolean;
    dataElement: string;
    column: string;
    open: false;
}

export interface IProgramTrackedEntityAttribute {
    valueType: string;
    mandatory: boolean;
    trackedEntityAttribute: string;
    column: string;
    open: false;
}

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

export interface ITrackedEntityAttribute extends CommonIdentifier {
    displayName: string;
    optionSet: string;
    optionSetValue: string;
    unique: boolean;
}

export interface ITrackedEntityType {
    id: string;
}

export interface IIntegrationStore {
    programs: IProgram[];
    dataSets: IDataSet[];
    program: string;
    dataSet: string;
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
    mappings: IMapping[];
    tracker: any;
    dataElements: IDataElement[];
    userGroups: string[];
    search: string;
    params: IParam[];
    programsFilter: "";
    expanded;
    hasMappingsNameSpace;
    aggregate;
    aggregates: [];
    schedulerEnabled: boolean;
    organisation: Organisation;
    isFull: boolean;
    dialogOpen: boolean;
    uploadData: boolean;
    importData: boolean;
    scheduled: boolean;
    schedules: ISchedule[];
    currentSchedule: ISchedule;
    scheduleTypes: { [key: string]: any }[];
    jump: boolean;
    aggregateJump: boolean;
    loading: boolean;
    open: boolean;
    totalDataSets: number;
    totalPrograms: number;
    paging: { [key: string]: any };
    programSchedule: any[];
}
