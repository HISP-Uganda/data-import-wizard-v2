import { CommonIdentifier, IMapping } from "../../Interfaces";

export interface IProgram extends IMapping {
    program: string;
    // id: string;
    // name: string;
    // displayName: string;
    // lastUpdated: any;
    programType: string;
    username: string;
    password: string;
    header: string;
    // programStages: IProgramStage[];
    // categoryCombo: string;
    // programTrackedEntityAttributes: any;
    // trackedEntityType: any;
    // trackedEntity: string;
    // mappingId: string;
    // isRunning: boolean;
    // orgUnitColumn: string;
    // orgUnitStrategy: {
    //     value: "auto";
    //     label: "auto";
    // };
    // organisationUnits: IOrganisationUnit[];
    // headerRow: 1;
    // dataStartRow: 2;
    // createNewEnrollments: false;
    // createEntities: false;
    // updateEntities: false;
    // enrollmentDateColumn: string;
    // incidentDateColumn: string;
    url: string;
    // dateFilter: string;
    // dateEndFilter: string;
    // lastRun: string;
    // uploaded: string;
    // uploadMessage: string;
    // page: number;
    // rowsPerPage: number;
    // dialogOpen: false;
    // orderBy: "mandatory";
    // order: "desc";
    // attributesFilter: string;

    // trackedEntityInstances: [];
    // fetchingEntities: 0;

    // responses: any[];

    // increment: 0;

    // errors: any[];
    // conflicts: any[];
    // duplicates: any[];

    // longitudeColumn: string;
    // latitudeColumn: string;

    // pulling: boolean;

    // workbook: null;

    // selectedSheet: null;

    // pulledData: null;

    // sheets: any[];

    dataSource: "xlsx" | "dhis2" | "api" | "csv" | "json";

    // scheduleTime: 0;

    // percentages: any[];

    // total: number;
    // displayProgress: boolean;

    // username: string;
    // password: string;
    // params: any[];
    // responseKey: string;
    // fileName: string;
    // mappingName: string;
    // mappingDescription: string;
    // templateType: string;
    // sourceOrganisationUnits: [];
    // message: string;
    // incidentDateProvided: boolean;
    // processed: boolean;
    // data: [];
    // isUploadingFromPage: boolean;

    // selectIncidentDatesInFuture: string;
    // selectEnrollmentDatesInFuture: string;
    // isDHIS2: boolean;
    // attributes: boolean;
    // remotePrograms: [];
    // remoteProgram: {};
    // remoteId: string;

    // enrollments: boolean;
    // events: boolean;
    // remoteStage: string;
    // remoteTrackedEntityTypes: {};
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

export interface IStore {}
