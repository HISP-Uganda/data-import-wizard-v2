import { CommonIdentifier, IMapping } from "../../Interfaces";

export interface IProgramMapping extends IMapping {
    program: string;
    // id: string;
    // name: string;
    // displayName: string;
    // lastUpdated: any;
    programType: string;

    // programStages: IProgramStage[];
    // categoryCombo: string;
    // programTrackedEntityAttributes: any;
    // trackedEntityType: any;
    // trackedEntity: string;
    // mappingId: string;
    // isRunning: boolean;
    orgUnitColumn: string;
    manuallyMapOrgUnitColumn: boolean;
    manuallyMapEnrollmentDateColumn: boolean;
    manuallyMapIncidentDateColumn: boolean;
    // orgUnitStrategy: {
    //     value: "auto";
    //     label: "auto";
    // };
    // organisationUnits: IOrganisationUnit[];
    // headerRow: 1;
    // dataStartRow: 2;
    createEnrollments: boolean;
    createEntities: boolean;
    updateEntities: boolean;
    enrollmentDateColumn: string;
    incidentDateColumn: string;
    authentication: {
        username: string;
        password: string;
        header: string;
        url: string;
    };
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
    dataElement: IDataElement;
    allowFutureDate: boolean;
}

export interface IProgramTrackedEntityAttribute {
    valueType: string;
    mandatory: boolean;
    trackedEntityAttribute: ITrackedEntityAttribute;
    open: false;
    name: string;
    program: CommonIdentifier;
    sortOrder: number;
    allowFutureDate: boolean;
    displayShortName: string;
    displayName: string;
    id: string;
}
export interface ITrackedEntityAttribute extends CommonIdentifier {
    displayName: string;
    optionSet: string;
    optionSetValue: boolean;
    unique: boolean;
}

export interface IDataElement extends CommonIdentifier {
    displayName: string;
    optionSet: boolean;
    optionSetValue: string;
    valueType: string;
    zeroIsSignificant: boolean;
}
export interface IProgram {
    name: string;
    shortName: string;
    enrollmentDateLabel: string;
    incidentDateLabel: string;
    programType: string;
    displayIncidentDate: boolean;
    ignoreOverdueEvents: boolean;
    onlyEnrollOnce: boolean;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    trackedEntityType: CommonIdentifier;
    categoryCombo: CommonIdentifier;
    featureType: string;
    displayEnrollmentDateLabel: string;
    displayIncidentDateLabel: string;
    registration: boolean;
    withoutRegistration: boolean;
    displayShortName: string;
    displayFormName: string;
    displayName: string;
    id: string;
    attributeValues: any[];
    organisationUnits: CommonIdentifier[];
    programStages: IProgramStage[];
    programSections: any[];
    programTrackedEntityAttributes: IProgramTrackedEntityAttribute[];
}

export interface Mapping {
    [key: string]: Partial<{
        manual: boolean;
        compulsory: boolean;
        allowFutureDate: boolean;
        value: string;
        eventDateColumn: string;
        valueType: string;
        unique: boolean;
        createEvents: boolean;
        updateEvents: boolean;
        eventDateIsUnique: boolean;
    }>;
}
