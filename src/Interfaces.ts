import { MakeGenerics } from "@tanstack/react-location";
import {IProgram} from "./pages/program/Interfaces";
import {IDataSet} from "./pages/aggregate/Interfaces";
import {ISchedule} from "./pages/schedules/Interfaces";

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

export interface ICategory extends CommonIdentifier {
    mapping: IMapping;
    categoryOptions: ICategoryOption[];
}

export interface ICategoryCombo extends CommonIdentifier {
    categoryOptionCombos: CategoryOptionCombo[];
    categories: ICategory[];
}

export interface ICategoryOption extends CommonIdentifier {}

export interface CategoryOptionCombo extends CommonIdentifier {
    categoryOptions: ICategoryOption[];
    mapping: IMapping;
    dataElement: IDataElement;
    cell: string;
    column: string;
}

export interface ICategoryCombo extends CommonIdentifier {}


export interface IDataElement extends CommonIdentifier {
    displayName: string;
    valueType: string;
    optionSet: OptionSet;
}

export interface IDataSetElement extends CommonIdentifier {
    open: boolean;
    dataElement: IDataElement;
}

export interface IElement extends CommonIdentifier {
    categoryCombo: ICategoryCombo;
    valueType: string;
    mapping: IMapping;
    uniqueCategoryOptionCombos: any;
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
    expanded: boolean;
    hasMappingsNameSpace: boolean;
    aggregate: any;
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
