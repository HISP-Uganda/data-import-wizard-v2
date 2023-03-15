import { fromPairs, groupBy, getOr } from "lodash/fp";
import { generateUid } from "../../utils/uid";
import { IProgramMapping, Mapping } from "./Interfaces";
import { processor } from "./Store";

const processEvents = (
    data: any[],
    programStageMapping: { [key: string]: Mapping }
) => {
    return Object.entries(programStageMapping).map(
        ([programStage, mapping]) => {
            let currentData = [];
            const { info, ...elements } = mapping;
            const eventDateColumn = info.eventDateColumn || "";
            const eventDateIsUnique = info.eventDateIsUnique;
            let uniqueColumns = Object.entries(elements).flatMap(
                ([, { unique, value }]) => {
                    if (unique && value) {
                        return value;
                    }
                    return [];
                }
            );
            if (eventDateIsUnique) {
                uniqueColumns = [...uniqueColumns, eventDateColumn];
            }

            if (uniqueColumns.length) {
                currentData = Object.values(
                    groupBy(
                        (item: any) =>
                            uniqueColumns.map((column) =>
                                getOr("", column, item)
                            ),
                        data
                    )
                ).map((data) => data[0]);
            }

            return currentData.map((currentRow) => {
                const eventDate = getOr("", eventDateColumn, currentRow);
                console.log(eventDate);

                const dataValues = Object.entries(elements).flatMap(
                    ([dataElement, { value }]) => {
                        console.log(value);
                        if (value) {
                            console.log(getOr("", value, currentRow));
                            return {
                                dataElement,
                                value: getOr("", value, currentRow),
                            };
                        }
                        return [];
                    }
                );
                return { eventDate, dataValues, programStage };
            });
        }
    );
};

export const processData = async (
    data: any[],
    programMapping: Partial<IProgramMapping>,
    organisationUnitMapping: Mapping,
    attributeMapping: Mapping,
    programStageMapping: { [key: string]: Mapping }
) => {
    const flippedUnits = fromPairs(
        Object.entries(organisationUnitMapping).map(([unit, value]) => {
            return [value.value, unit];
        })
    );
    const orgUnitColumn = programMapping.orgUnitColumn || "";
    const enrollmentDateColumn = programMapping.enrollmentDateColumn || "";
    const incidentDateColumn = programMapping.incidentDateColumn || "";
    const uniqColumns = Object.values(attributeMapping).flatMap((o) => {
        if (o.unique && o.value) {
            return o.value;
        }
        return [];
    });

    const groupedData = groupBy(
        (item: any) => uniqColumns.map((column) => getOr("", column, item)),
        data
    );

    const processed = Object.values(groupedData).map((current) => {
        const orgUnit = getOr(
            "",
            getOr("", orgUnitColumn, current[0]),
            flippedUnits
        );
        const enrollmentDate = getOr("", enrollmentDateColumn, current[0]);
        const incidentDate = getOr("", incidentDateColumn, current[0]);
        const enrollment = {
            program: programMapping.program,
            orgUnit,
            enrollmentDate,
            incidentDate,
        };
        const attributes = Object.entries(attributeMapping).flatMap(
            ([attribute, { value }]) => {
                if (value) {
                    return {
                        attribute,
                        value: getOr("", value, current[0]),
                    };
                }
                return [];
            }
        );

        const trackedEntityInstance = {
            trackedEntityInstance: generateUid(),
            attributes,
            orgUnit,
        };
        const events = processEvents(current, programStageMapping);
        return { trackedEntityInstance, enrollment, events };
    });

    const trackedEntityInstances = processed.map(
        ({ trackedEntityInstance }) => trackedEntityInstance
    );
    const enrollments = processed.map(({ enrollment }) => enrollment);
    const events = processed.flatMap(({ events }) => events.flat());
    processor.addInstances(trackedEntityInstances);
    processor.addEnrollments(enrollments);
    processor.addEvents(events);
};
