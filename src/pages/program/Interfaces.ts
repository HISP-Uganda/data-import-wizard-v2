import {IOrganisationUnit, IProgramStage} from "../../Interfaces";

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
    incidentDateColumn: string;
    url: string;
    dateFilter: string;
    dateEndFilter: string;
    lastRun: string;
    uploaded: string;
    uploadMessage: string;
    page: number;
    rowsPerPage: number;
    dialogOpen: false;
    orderBy: "mandatory";
    order: "desc";
    attributesFilter: string;

    trackedEntityInstances: [];
    fetchingEntities: 0;

    responses: any[];

    increment: 0;

    errors: any[];
    conflicts: any[];
    duplicates: any[];

    longitudeColumn: string;
    latitudeColumn: string;

    pulling: boolean;

    workbook: null;

    selectedSheet: null;

    pulledData: null;

    sheets: any[];

    dataSource: "xlsx";

    scheduleTime: 0;

    percentages: any[];

    total: number;
    displayProgress: boolean;

    username: string;
    password: string;
    params: any[];
    responseKey: string;
    fileName: string;
    mappingName: string;
    mappingDescription: string;
    templateType: string;
    sourceOrganisationUnits: [];
    message: string;
    incidentDateProvided: boolean;
    processed: boolean;
    data: [];
    isUploadingFromPage: boolean;

    selectIncidentDatesInFuture: string;
    selectEnrollmentDatesInFuture: string;
    isDHIS2: boolean;
    attributes: boolean;
    remotePrograms: [];
    remoteProgram: {};
    remoteId: string;

    enrollments: boolean;
    events: boolean;
    remoteStage: string;
    remoteTrackedEntityTypes: {};
}