import { z } from "zod";
import { CommonIdentifier, IMapping } from "../../Interfaces";

export const ValueType = {
    TEXT: z.string(),
    LONG_TEXT: z.string(),
    LETTER: z.string().length(1),
    PHONE_NUMBER: z.string(),
    EMAIL: z.string().email(),
    BOOLEAN: z.boolean(),
    TRUE_ONLY: z.literal(true),
    DATE: z.string().regex(/^(\d{4})-(\d{2})-(\d{2})/),
    DATETIME: z
        .string()
        .regex(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/
        ),
    TIME: z.string().regex(/^(\d{2}):(\d{2})/),
    NUMBER: z.number(),
    UNIT_INTERVAL: z.string(),
    PERCENTAGE: z.number().int().gte(0).lte(100),
    INTEGER: z.number().int(),
    INTEGER_POSITIVE: z.number().int().positive().min(1),
    INTEGER_NEGATIVE: z.number().int().negative(),
    INTEGER_ZERO_OR_POSITIVE: z.number().int().min(0),
    TRACKER_ASSOCIATE: z.string().length(11),
    USERNAME: z.string(),
    COORDINATE: z.string(),
    ORGANISATION_UNIT: z.string().length(11),
    REFERENCE: z.string().length(11),
    AGE: z.string().regex(/^(\d{4})-(\d{2})-(\d{2})/),
    URL: z.string().url(),
    FILE_RESOURCE: z.string(),
    IMAGE: z.string(),
    GEOJSON: z.string(),
    MULTI_TEXT: z.string(),
};

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
    trackedEntityType: string;
    // trackedEntity: string;
    // mappingId: string;
    // isRunning: boolean;
    orgUnitColumn: string;
    manuallyMapOrgUnitColumn: boolean;
    manuallyMapEnrollmentDateColumn: boolean;
    manuallyMapIncidentDateColumn: boolean;
    orgUnitsUploaded: boolean;
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
    biDirectional: boolean;
    prefetch: boolean;
    authentication: Partial<{
        basicAuth: boolean;
        username: string;
        password: string;
        url: string;
        hasNextLink: boolean;
        headers: {
            [key: string]: Partial<{
                param: string;
                value: string;
                forUpdates: boolean;
            }>;
        };
        params: {
            [key: string]: Partial<{
                param: string;
                value: string;
                forUpdates: boolean;
            }>;
        };
    }>;
    trackedEntityInstanceColumn: string;
    trackedEntityInstanceColumnIsManual: boolean;
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
    isDHIS2: boolean;
    // attributes: boolean;
    // remotePrograms: [];
    remoteProgram: string;
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
    valueType: keyof typeof ValueType;
    confidential: boolean;
    unique: boolean;
    generated: boolean;
    pattern: string;
    optionSetValue: boolean;
    displayFormName: string;
    optionSet?: OptionSet;
}

interface OptionSet {
    name: string;
    options: CommonIdentifier[];
    id: string;
}

export interface IDataElement extends CommonIdentifier {
    displayName: string;
    optionSet: boolean;
    optionSetValue: string;
    valueType: keyof typeof ValueType;
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
        value: string;
        eventDateColumn: string;
        unique: boolean;
        createEvents: boolean;
        updateEvents: boolean;
        eventDateIsUnique: boolean;
        eventIdColumn: string;
        stage: string;
        eventIdColumnIsManual: boolean;
    }>;
}
export interface TrackedEntityInstance {
    created: string;
    orgUnit: string;
    createdAtClient: string;
    trackedEntityInstance: string;
    lastUpdated: string;
    trackedEntityType: string;
    potentialDuplicate: boolean;
    deleted: boolean;
    inactive: boolean;
    featureType: string;
    programOwners: ProgramOwner[];
    enrollments: Array<Partial<Enrollment>>;
    relationships: any[];
    attributes: Array<Partial<Attribute>>;
}

export interface Enrollment {
    createdAtClient: string;
    program: string;
    lastUpdated: string;
    created: string;
    orgUnit: string;
    enrollment: string;
    trackedEntityInstance: string;
    trackedEntityType: string;
    orgUnitName: string;
    enrollmentDate: string;
    followup: boolean;
    deleted: boolean;
    incidentDate: string;
    status: string;
    notes: any[];
    relationships: any[];
    events: Event[];
    attributes: Attribute[];
}

export interface Attribute {
    lastUpdated: string;
    displayName: string;
    created: string;
    valueType: keyof typeof ValueType;
    attribute: string;
    value: string;
    code?: string;
}

export interface Event {
    dueDate: string;
    createdAtClient: string;
    program: string;
    event: string;
    programStage: string;
    orgUnit: string;
    enrollment: string;
    trackedEntityInstance: string;
    enrollmentStatus: string;
    status: string;
    eventDate: string;
    orgUnitName: string;
    attributeCategoryOptions: string;
    lastUpdated: string;
    created: string;
    followup: boolean;
    deleted: boolean;
    attributeOptionCombo: string;
    dataValues: Array<Partial<DataValue>>;
    notes: any[];
    relationships: any[];
}

export interface DataValue {
    lastUpdated: string;
    created: string;
    dataElement: string;
    value: string;
    providedElsewhere: boolean;
}

interface ProgramOwner {
    ownerOrgUnit: string;
    program: string;
    trackedEntityInstance: string;
}
