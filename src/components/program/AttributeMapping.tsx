import { Checkbox, Stack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { CQIDexie } from "../../db";
import { attributeMappingApi, mappingApi } from "../../Events";
import { $attributeMapping, $mapping, $metadata, $program } from "../../Store";
import GenericMapping from "../GenericMapping";
import InfoMapping from "../InfoMapping";

export default function AttributeMapping({ db }: { db: CQIDexie }) {
    const metadata = useStore($metadata);
    const program = useStore($program);
    const mapping = useStore($mapping);
    const attributeMapping = useStore($attributeMapping);
    const {
        customTrackedEntityInstanceColumn = false,
        trackedEntityInstanceColumn = "",
        customGeometryColumn = false,
        createEntities = false,
        updateEntities = false,
        geometryColumn = "",
    } = mapping.trackedEntityMapping ?? {};

    const {
        customEnrollmentDateColumn = false,
        enrollmentDateColumn = "",
        createEnrollments = false,
        updateEnrollments = false,
        enrollmentIdColumn = "",
        customEnrollmentIdColumn = false,
        customIncidentDateColumn = false,
        incidentDateColumn = "",
        customGeometryColumn: customEnrollmentGeometryColumn = false,
        geometryColumn: enrollmentGeometryColumn = "",
    } = mapping.enrollmentMapping ?? {};
    return (
        <Stack
            h="calc(100vh - 320px)"
            maxH="calc(100vh - 320px)"
            overflow="auto"
            spacing="25px"
        >
            <Stack direction="row" spacing="20px">
                <InfoMapping
                    value={trackedEntityInstanceColumn}
                    isChecked={customTrackedEntityInstanceColumn}
                    title="Track Entity Column"
                    title2="Custom Track Entity Column"
                    onCustomChange={(customTrackedEntityInstanceColumn) => {
                        mappingApi.updateMany({
                            trackedEntityMapping: {
                                ...mapping.trackedEntityMapping,
                                customTrackedEntityInstanceColumn,
                            },
                        });
                    }}
                    onValueChange={(trackedEntityInstanceColumn) => {
                        mappingApi.updateMany({
                            trackedEntityMapping: {
                                ...mapping.trackedEntityMapping,
                                trackedEntityInstanceColumn,
                            },
                        });
                    }}
                />
                {program.trackedEntityType?.featureType !== "NONE" &&
                    program.trackedEntityType?.featureType !== undefined && (
                        <InfoMapping
                            value={geometryColumn}
                            isChecked={customGeometryColumn}
                            title="Geometry Column"
                            title2="Custom Geometry Column"
                            isMulti
                            onCustomChange={(customGeometryColumn) => {
                                mappingApi.updateMany({
                                    trackedEntityMapping: {
                                        ...mapping.trackedEntityMapping,
                                        customGeometryColumn,
                                    },
                                });
                            }}
                            onValueChange={(geometryColumn) => {
                                mappingApi.updateMany({
                                    trackedEntityMapping: {
                                        ...mapping.trackedEntityMapping,
                                        geometryColumn,
                                    },
                                });
                            }}
                        />
                    )}

                <InfoMapping
                    value={enrollmentIdColumn}
                    isChecked={customEnrollmentIdColumn}
                    title="Enrollment ID Column"
                    title2="Custom Enrollment ID Column"
                    onCustomChange={(customEnrollmentIdColumn) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                customEnrollmentIdColumn,
                            },
                        });
                    }}
                    onValueChange={(enrollmentIdColumn) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                enrollmentIdColumn,
                            },
                        });
                    }}
                />

                <InfoMapping
                    value={enrollmentDateColumn}
                    isChecked={customEnrollmentDateColumn}
                    title="Enrollment Date Column"
                    title2="Custom Enrollment Date Column"
                    onCustomChange={(customEnrollmentDateColumn) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                customEnrollmentDateColumn,
                            },
                        });
                    }}
                    onValueChange={(enrollmentDateColumn) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                enrollmentDateColumn,
                            },
                        });
                    }}
                />
                <InfoMapping
                    value={incidentDateColumn}
                    isChecked={customIncidentDateColumn}
                    title="Incident Column"
                    title2="Custom Incident Column"
                    onCustomChange={(customIncidentDateColumn) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                customIncidentDateColumn,
                            },
                        });
                    }}
                    onValueChange={(incidentDateColumn) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                incidentDateColumn,
                            },
                        });
                    }}
                />
                {program.featureType !== "NONE" &&
                    program.featureType !== undefined && (
                        <InfoMapping
                            value={enrollmentGeometryColumn}
                            isChecked={customEnrollmentGeometryColumn}
                            title="Geometry Column"
                            title2="Custom Geometry Column"
                            onCustomChange={(customGeometryColumn) => {
                                mappingApi.updateMany({
                                    enrollmentMapping: {
                                        ...mapping.enrollmentMapping,
                                        customGeometryColumn,
                                    },
                                });
                            }}
                            onValueChange={(geometryColumn) => {
                                mappingApi.updateMany({
                                    enrollmentMapping: {
                                        ...mapping.enrollmentMapping,
                                        geometryColumn,
                                    },
                                });
                            }}
                            isMulti
                        />
                    )}
            </Stack>
            <Stack spacing={[1, 5]} direction={["column", "row"]}>
                <Checkbox
                    colorScheme="green"
                    isChecked={createEntities}
                    onChange={(e) =>
                        mappingApi.updateMany({
                            trackedEntityMapping: {
                                ...mapping.trackedEntityMapping,
                                createEntities: e.target.checked,
                            },
                        })
                    }
                >
                    Create Entities
                </Checkbox>

                <Checkbox
                    colorScheme="green"
                    isChecked={updateEntities}
                    onChange={(e) => {
                        mappingApi.updateMany({
                            trackedEntityMapping: {
                                ...mapping.trackedEntityMapping,
                                updateEntities: e.target.checked,
                            },
                        });
                    }}
                >
                    Update Entities
                </Checkbox>
                <Checkbox
                    colorScheme="green"
                    isChecked={createEnrollments}
                    onChange={(e) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                createEnrollments: e.target.checked,
                            },
                        });
                    }}
                >
                    Create Enrollments
                </Checkbox>

                <Checkbox
                    colorScheme="green"
                    isChecked={updateEnrollments}
                    onChange={(e) => {
                        mappingApi.updateMany({
                            enrollmentMapping: {
                                ...mapping.enrollmentMapping,
                                updateEnrollments: e.target.checked,
                            },
                        });
                    }}
                >
                    Update Enrollments
                </Checkbox>
            </Stack>
            <GenericMapping
                destinationOptions={metadata.destinationTrackedEntityAttributes}
                sourceOptions={metadata.sourceColumns}
                mapped={attributeMapping}
                updater={attributeMappingApi.updateMany}
                db={db}
                merger={attributeMappingApi.merge}
            />
        </Stack>
    );
}
