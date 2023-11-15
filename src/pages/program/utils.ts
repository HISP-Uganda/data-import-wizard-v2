import { Mapping } from "classnames";
import {
    IProgramStage,
    DataValue,
    IProgramMapping,
    IProgram,
    Enrollment,
    TrackedEntityInstance,
    Attribute,
} from "data-import-wizard-utils";
import { format, parseISO } from "date-fns/fp";
import { Dictionary } from "lodash";
import { fromPairs, get, getOr, groupBy, isEmpty, toPairs } from "lodash/fp";
import { z } from "zod";
import { generateUid } from "../../utils/uid";

// const parseAndFormatDate = (date: string) => {
//     const parsedDate = Date.parse(date);
//     if (Number.isNaN(parsedDate)) {
//         return new Date(parsedDate);
//     }
// };

// export const compareArrays = <TData>(
//     source: TData[],
//     destination: TData[],
//     key: string
// ) => {
//     const sourceKeys = source.map((val) => get(key, val)).sort();
//     const sourceValues = source.map((val) => get("value", val)).sort();
//     const destinationKeys = destination.map((val) => get(key, val)).sort();
//     const destinationValues = destination
//         .map((val) => get("value", val))
//         .sort();

//     const haveSameKeys = sourceKeys.every((element) => {
//         return destinationKeys.includes(element);
//     });
//     const haveSameValues = sourceValues.every((element) => {
//         return destinationValues.includes(element);
//     });
//     return haveSameKeys && haveSameValues;
// };

// export const mergeArrays = <TData>(
//     source: TData[],
//     destination: TData[],
//     key: string
// ) => {
//     const sources = source.map((val: TData) => [get(key, val), val]);
//     let destinations = fromPairs<TData>(
//         destination.map((val) => [get(key, val), val])
//     );

//     sources.forEach(([key, value]) => {
//         destinations = { ...destinations, [key]: value };
//     });
//     return Object.values(destinations);
// };

// const processEvents = (
//     data: any[],
//     programStageMapping: { [key: string]: Mapping },
//     trackedEntityInstance: string,
//     enrollment: string,
//     orgUnit: string,
//     program: string,
//     previousEvents: Dictionary<{
//         [key: string]: Array<{ dataElement: string; value: string }>;
//     }>,
//     stages: Dictionary<IProgramStage>
// ) => {
//     return Object.entries(programStageMapping).flatMap(
//         ([programStage, mapping]) => {
//             const { repeatable } = stages[programStage];
//             const stagePreviousEvents = previousEvents[programStage];
//             let currentData = fromPairs([["all", data]]);
//             const { info, ...elements } = mapping;
//             const eventDateColumn = info.eventDateColumn || "";
//             const eventDateIsUnique = info.eventDateIsUnique;
//             const eventIdColumn = info.eventIdColumn || "";

//             let uniqueColumns = Object.entries(elements).flatMap(
//                 ([, { unique, value }]) => {
//                     if (unique && value) {
//                         return value;
//                     }
//                     return [];
//                 }
//             );
//             if (eventDateIsUnique) {
//                 uniqueColumns = [...uniqueColumns, eventDateColumn];
//             }

//             if (eventIdColumn) {
//                 uniqueColumns = [...uniqueColumns, eventIdColumn];
//             }

//             if (uniqueColumns.length) {
//                 currentData = groupBy(
//                     (item: any) =>
//                         uniqueColumns.map((column) => {
//                             if (column === eventDateColumn) {
//                                 return format(
//                                     "yyyy-MM-dd",
//                                     parseISO(getOr("", column, item))
//                                 );
//                             }
//                             return getOr("", column, item);
//                         }),
//                     data
//                 );
//             }

//             const allValues = Object.entries(currentData);
//             if (repeatable) {
//                 return allValues.flatMap(([key, currentRow]) => {
//                     const prev = stagePreviousEvents[key];
//                     return currentRow.flatMap((row) => {
//                         const eventDate: string = format(
//                             "yyyy-MM-dd",
//                             parseISO(getOr("", eventDateColumn, row))
//                         );
//                         if (eventDate) {
//                             const eventId = generateUid();
//                             const dataValues: Array<Partial<DataValue>> =
//                                 Object.entries(elements).flatMap(
//                                     ([dataElement, { value }]) => {
//                                         if (value) {
//                                             const dv: Partial<DataValue> = {
//                                                 dataElement,
//                                                 value: getOr("", value, row),
//                                             };
//                                             return dv;
//                                         }
//                                         return [];
//                                     }
//                                 );
//                             return {
//                                 eventDate,
//                                 dataValues,
//                                 programStage,
//                                 enrollment,
//                                 trackedEntityInstance,
//                                 program,
//                                 orgUnit,
//                                 event: eventId,
//                             };
//                         }
//                         return [];
//                     });
//                 });
//             } else if (allValues.length > 0) {
//                 const [key, currentRow] = allValues[0];
//                 const prev = stagePreviousEvents[key];
//                 if (isEmpty(prev)) {
//                     return currentRow.flatMap((row) => {
//                         const eventDate: string = format(
//                             "yyyy-MM-dd",
//                             parseISO(getOr("", eventDateColumn, row))
//                         );
//                         if (eventDate) {
//                             const eventId = generateUid();
//                             const dataValues: Array<Partial<DataValue>> =
//                                 Object.entries(elements).flatMap(
//                                     ([dataElement, { value }]) => {
//                                         if (value) {
//                                             const dv: Partial<DataValue> = {
//                                                 dataElement,
//                                                 value: getOr("", value, row),
//                                             };
//                                             return dv;
//                                         }
//                                         return [];
//                                     }
//                                 );
//                             return {
//                                 eventDate,
//                                 dataValues,
//                                 programStage,
//                                 enrollment,
//                                 trackedEntityInstance,
//                                 program,
//                                 orgUnit,
//                                 event: eventId,
//                             };
//                         }
//                         return [];
//                     });
//                 } else {
//                 }
//             }
//             return [];
//         }
//     );
// };

// export const processData = async (
//     previousData: {
//         attributes: Dictionary<Array<{ attribute: string; value: string }>>;
//         dataElements: Dictionary<
//             Dictionary<{
//                 [key: string]: Array<{ dataElement: string; value: string }>;
//             }>
//         >;
//         enrollments: Dictionary<string>;
//         trackedEntities: Dictionary<string>;
//     },
//     data: any[],
//     programMapping: Partial<IProgramMapping>,
//     organisationUnitMapping: Mapping,
//     attributeMapping: Mapping,
//     programStageMapping: { [key: string]: Mapping },
//     programUniqAttributes: string[],
//     programStageUniqueElements: { [key: string]: string[] },
//     programUniqColumns: string[],
//     version: number,
//     program: Partial<IProgram>,
//     elements: Dictionary<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>,
//     attributesSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>
// ) => {
//     const {
//         onlyEnrollOnce,
//         selectEnrollmentDatesInFuture,
//         selectIncidentDatesInFuture,
//         programTrackedEntityAttributes,
//         programStages,
//     } = program;

//     const programAttributes = fromPairs(
//         programTrackedEntityAttributes?.map(
//             ({ trackedEntityAttribute, mandatory }) => {
//                 return [
//                     trackedEntityAttribute.id,
//                     { ...trackedEntityAttribute, mandatory },
//                 ];
//             }
//         )
//     );

//     const stages = fromPairs(
//         programStages?.map((programStage) => {
//             return [programStage.id, programStage];
//         })
//     );

//     const { createEntities, createEnrollments, updateEntities } =
//         programMapping;

//     const flippedUnits = fromPairs(
//         Object.entries(organisationUnitMapping).map(([unit, value]) => {
//             return [value.value, unit];
//         })
//     );
//     const orgUnitColumn = programMapping.orgUnitColumn || "";
//     const enrollmentDateColumn = programMapping.enrollmentDateColumn || "";
//     const incidentDateColumn = programMapping.incidentDateColumn || "";
//     let groupedData = groupBy(
//         "id",
//         data.map((d) => {
//             return { id: generateUid(), ...d };
//         })
//     );

//     if (programUniqColumns.length > 0) {
//         groupedData = groupBy(
//             (item: any) =>
//                 programUniqColumns
//                     .map((column) => getOr("", column, item))
//                     .sort()
//                     .join(""),
//             data
//         );
//     }
//     const processed = Object.entries(groupedData).flatMap(
//         ([uniqueKey, current]) => {
//             const orgUnit = getOr(
//                 "",
//                 getOr("", orgUnitColumn, current[0]),
//                 flippedUnits
//             );
//             let results: {
//                 enrollments: Array<Partial<Enrollment>>;
//                 trackedEntities: Array<Partial<TrackedEntityInstance>>;
//                 events: Array<Partial<Event>>;
//                 eventUpdates: Array<Partial<Event>>;
//                 trackedEntityUpdates: Array<Partial<TrackedEntityInstance>>;
//             } = {
//                 enrollments: [],
//                 trackedEntities: [],
//                 events: [],
//                 eventUpdates: [],
//                 trackedEntityUpdates: [],
//             };
//             if (orgUnit) {
//                 let previousTrackedEntity = getOr(
//                     "",
//                     uniqueKey,
//                     previousData.trackedEntities
//                 );
//                 let previousEnrollment = getOr(
//                     "",
//                     uniqueKey,
//                     previousData.enrollments
//                 );

//                 const trackedEntityInstanceId =
//                     previousTrackedEntity || generateUid();

//                 const enrollmentId = previousEnrollment || generateUid();

//                 const previousAttributes = getOr(
//                     [],
//                     uniqueKey,
//                     previousData.attributes
//                 );

//                 const currentAttributes = Object.entries(
//                     attributeMapping
//                 ).flatMap(([attribute, { value }]) => {
//                     const attributeDetails = programAttributes[attribute];
//                     const realValue = getOr("", value || "", current[0]);
//                     if (realValue) {
//                         const attr: Partial<Attribute> = {
//                             attribute,
//                             value: realValue,
//                         };
//                         return attr;
//                     }
//                     return [];
//                 });

//                 const currentAttributeValues = fromPairs(
//                     currentAttributes.map(({ attribute, value }) => [
//                         attribute,
//                         value,
//                     ])
//                 );
//                 const { ["lZGmxYbs97q"]: removed, ...rest } =
//                     currentAttributeValues;

//                 if (previousAttributes.length > 0 && updateEntities) {
//                     if (
//                         !compareArrays(
//                             currentAttributes,
//                             previousAttributes,
//                             "attribute"
//                         )
//                     ) {
//                         const attributes = mergeArrays(
//                             currentAttributes,
//                             previousAttributes,
//                             "attribute"
//                         );
//                         results = {
//                             ...results,
//                             trackedEntityUpdates: [
//                                 {
//                                     trackedEntityInstance:
//                                         trackedEntityInstanceId,
//                                     attributes,
//                                     trackedEntityType:
//                                         programMapping.trackedEntityType,
//                                     orgUnit,
//                                 },
//                             ],
//                         };
//                     }
//                 } else if (previousAttributes.length === 0 && createEntities) {
//                     results = {
//                         ...results,
//                         trackedEntities: [
//                             {
//                                 trackedEntityInstance: trackedEntityInstanceId,
//                                 attributes: currentAttributes,
//                                 trackedEntityType:
//                                     programMapping.trackedEntityType,
//                                 orgUnit,
//                             },
//                         ],
//                     };
//                 }
//                 if (createEnrollments && isEmpty(previousEnrollment)) {
//                     const enrollmentDate = getOr(
//                         "",
//                         enrollmentDateColumn,
//                         current[0]
//                     );
//                     const incidentDate = getOr(
//                         "",
//                         incidentDateColumn,
//                         current[0]
//                     );

//                     if (enrollmentDate && incidentDate) {
//                         const enrollment = {
//                             program: programMapping.program,
//                             trackedEntityInstance: trackedEntityInstanceId,
//                             orgUnit,
//                             enrollmentDate: format(
//                                 "yyyy-MM-dd",
//                                 parseISO(enrollmentDate)
//                             ),
//                             incidentDate: format(
//                                 "yyyy-MM-dd",
//                                 parseISO(incidentDate)
//                             ),
//                             enrollment: enrollmentId,
//                         };

//                         results = { ...results, enrollments: [enrollment] };
//                     }
//                 }

//                 const events = processEvents(
//                     current,
//                     programStageMapping,
//                     trackedEntityInstanceId,
//                     enrollmentId,
//                     orgUnit,
//                     programMapping.program || "",
//                     getOr(
//                         {},
//                         getOr(
//                             "",
//                             programUniqColumns.sort().join(""),
//                             current[0]
//                         ),
//                         previousData.dataElements
//                     ),
//                     stages
//                 );
//                 results = { ...results, events };
//                 return results;
//             }
//             return results;
//         }
//     );

//     const trackedEntityInstances = processed.flatMap(
//         ({ trackedEntities }) => trackedEntities
//     );
//     const enrollments = processed.flatMap(({ enrollments }) => enrollments);
//     const events = processed.flatMap(({ events }) => events.flat());
//     return { trackedEntityInstances, events, enrollments };
// };

// export const processPreviousInstances = (
//     trackedEntityInstances: TrackedEntityInstance[],
//     programUniqAttributes: string[],
//     programStageUniqueElements: { [key: string]: string[] },
//     currentProgram: string
// ) => {
//     let currentAttributes: Array<[string, any]> = [];
//     let currentElements: Array<[string, any]> = [];
//     let currentEnrollments: Array<[string, string]> = [];
//     let currentTrackedEntities: Array<[string, string]> = [];
//     trackedEntityInstances.forEach(
//         ({ enrollments, attributes, trackedEntityInstance }) => {
//             const attributeKey = [
//                 ...attributes,
//                 {
//                     attribute: "trackedEntityInstance",
//                     value: trackedEntityInstance,
//                 },
//             ]
//                 .flatMap(({ attribute, value }) => {
//                     if (
//                         attribute &&
//                         programUniqAttributes.indexOf(attribute) !== -1
//                     ) {
//                         return value;
//                     }
//                     return [];
//                 })
//                 .sort()
//                 .join("");
//             currentTrackedEntities.push([attributeKey, trackedEntityInstance]);
//             currentAttributes.push([attributeKey, attributes]);
//             if (enrollments.length > 0) {
//                 const previousEnrollment = enrollments.find(
//                     ({ program }: any) => program === currentProgram
//                 );
//                 if (previousEnrollment) {
//                     const { events, enrollment } = previousEnrollment;
//                     currentEnrollments.push([attributeKey, String(enrollment)]);
//                     const groupedEvents = groupBy("programStage", events);
//                     const uniqueEvents = Object.entries(groupedEvents).flatMap(
//                         ([stage, availableEvents]) => {
//                             const stageElements =
//                                 programStageUniqueElements[stage];
//                             if (stageElements) {
//                                 const elements = availableEvents.map(
//                                     (event) => {
//                                         const finalValues = [
//                                             ...event.dataValues,
//                                             {
//                                                 dataElement: "eventDate",
//                                                 value: format(
//                                                     "yyyy-MM-dd",
//                                                     parseISO(event.eventDate)
//                                                 ),
//                                             },
//                                             {
//                                                 dataElement: "event",
//                                                 value: event.event,
//                                             },
//                                         ].map(({ dataElement, value }) => [
//                                             dataElement,
//                                             value,
//                                         ]);
//                                         const dataElementKey = finalValues
//                                             .flatMap(([dataElement, value]) => {
//                                                 if (
//                                                     dataElement &&
//                                                     stageElements.indexOf(
//                                                         dataElement
//                                                     ) !== -1
//                                                 ) {
//                                                     return value;
//                                                 }
//                                                 return [];
//                                             })
//                                             .sort()
//                                             .join("");

//                                         return [
//                                             dataElementKey,
//                                             fromPairs(finalValues),
//                                         ];
//                                     }
//                                 );
//                                 return [[stage, fromPairs(elements)]];
//                             }
//                             return [];
//                         }
//                     );
//                     currentElements.push([
//                         attributeKey,
//                         fromPairs(uniqueEvents),
//                     ]);
//                 }
//             }
//         }
//     );
//     return {
//         attributes:
//             fromPairs<Array<{ attribute: string; value: string }>>(
//                 currentAttributes
//             ),
//         dataElements: fromPairs<
//             Dictionary<{
//                 [key: string]: Array<{ dataElement: string; value: string }>;
//             }>
//         >(currentElements),
//         enrollments: fromPairs<string>(currentEnrollments),
//         trackedEntities: fromPairs<string>(currentTrackedEntities),
//     };
// };

// export const flattenTrackedEntityInstances = (response: {
//     trackedEntityInstances: Array<TrackedEntityInstance>;
// }) => {
//     return response.trackedEntityInstances.flatMap(
//         ({
//             attributes,
//             trackedEntityInstance,
//             enrollments,
//             orgUnit,
//             deleted,
//             trackedEntityType,
//         }) => {
//             const attributeValues = fromPairs(
//                 attributes.map(({ attribute, value }) => [
//                     `${attribute}`,
//                     value,
//                 ])
//             );
//             const foundEvents = enrollments.flatMap(({ events }) => {
//                 return events?.map(
//                     ({
//                         dataValues,
//                         programStage,
//                         program,
//                         orgUnit,
//                         orgUnitName,
//                         event,
//                         eventDate,
//                     }) => {
//                         const dvs = fromPairs(
//                             dataValues.map(({ dataElement, value }) => [
//                                 dataElement,
//                                 value,
//                             ])
//                         );
//                         return {
//                             trackedEntityInstance,
//                             deleted,
//                             trackedEntityType,
//                             ...dvs,
//                             ...attributeValues,
//                             programStage,
//                             program,
//                             orgUnit,
//                             orgUnitName,
//                             event,
//                             eventDate,
//                         };
//                     }
//                 );
//             });

//             if (foundEvents) {
//                 return foundEvents;
//             }
//             return {
//                 ...attributeValues,
//                 trackedEntityInstance,
//                 deleted,
//                 trackedEntityType,
//                 orgUnit,
//             };
//         }
//     );
// };
