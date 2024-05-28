import {
    Box,
    Checkbox,
    Input,
    Stack,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import {
    IMapping,
    IProgramMapping,
    Option,
    pullRemoteData,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect } from "react";
import {
    $data,
    $goData,
    $mapping,
    $metadata,
    $program,
    $remoteAPI,
    $token,
    $tokens,
} from "../../Store";

import { dataApi, mappingApi } from "../../Events";
import Progress from "../Progress";

const CheckSelect2 = ({
    field,
    label,
    otherField,
}: {
    field: keyof IProgramMapping;
    otherField: keyof IProgramMapping;
    label: string;
}) => {
    const programMapping = useStore($mapping);
    const metadata = useStore($metadata);

    const isManual =
        programMapping.dataSource !== "dhis2-program" &&
        programMapping.isSource;

    return (
        <Stack spacing="40px">
            <Stack direction="row">
                <Text w="200px">{label}</Text>
                <Stack flex={1}>
                    {!isManual && (
                        <Checkbox
                            isChecked={!!programMapping.program?.[otherField]}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: "program",
                                    path: otherField,
                                    value: e.target.checked,
                                })
                            }
                        >
                            Custom {label}
                        </Checkbox>
                    )}
                    <Box>
                        {!programMapping.program?.[otherField] && !isManual ? (
                            <Select<Option, false, GroupBase<Option>>
                                options={metadata.sourceColumns}
                                isClearable
                                value={metadata.sourceColumns.find((value) => {
                                    return (
                                        value.value ===
                                        getOr(
                                            "",
                                            `program.${field}`,
                                            programMapping
                                        )
                                    );
                                })}
                                onChange={(e) =>
                                    mappingApi.update({
                                        attribute: "program",
                                        path: field,
                                        value: e?.value || "",
                                    })
                                }
                            />
                        ) : (
                            <Input
                                value={String(
                                    getOr(
                                        "",
                                        `program.${field}`,
                                        programMapping
                                    )
                                )}
                                onChange={(e) =>
                                    mappingApi.update({
                                        attribute: "program",
                                        path: field,
                                        value: e.target.value,
                                    })
                                }
                            />
                        )}
                    </Box>
                </Stack>
            </Stack>
        </Stack>
    );
};

const CheckSelect = ({
    field,
    label,
    otherField,
    otherKeys,
}: {
    field: keyof IMapping;
    otherField: keyof IMapping;
    otherKeys?: string;
    label: string;
}) => {
    const programMapping = useStore($mapping);
    const metadata = useStore($metadata);

    const isManual =
        programMapping.dataSource !== "dhis2-program" &&
        programMapping.isSource;

    return (
        <Stack spacing="40px">
            <Stack direction="row">
                <Text w="200px">{label}</Text>
                <Stack flex={1}>
                    {!isManual && (
                        <Checkbox
                            isChecked={!!programMapping[otherField]}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: otherField,
                                    value: e.target.checked,
                                })
                            }
                        >
                            Custom {label}
                        </Checkbox>
                    )}
                    <Box>
                        {!programMapping[otherField] && !isManual ? (
                            <Select<Option, false, GroupBase<Option>>
                                options={metadata.sourceColumns}
                                isClearable
                                value={metadata.sourceColumns.find((value) => {
                                    return (
                                        value.value ===
                                        getOr("", field, programMapping)
                                    );
                                })}
                                onChange={(e) =>
                                    mappingApi.update({
                                        attribute: field,
                                        value: e?.value || "",
                                    })
                                }
                            />
                        ) : (
                            <Input
                                value={String(getOr("", field, programMapping))}
                                onChange={(e) =>
                                    mappingApi.update({
                                        attribute: field,
                                        value: e.target.value,
                                    })
                                }
                            />
                        )}
                    </Box>
                </Stack>
            </Stack>
        </Stack>
    );
};

export default function MappingOptions() {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($mapping);
    const data = useStore($data);
    const remoteAPI = useStore($remoteAPI);
    const goData = useStore($goData);
    const token = useStore($token);
    const tokens = useStore($tokens);
    const program = useStore($program);
    const metadata = useStore($metadata);

    const fetchRemoteData = async () => {
        if (remoteAPI && !programMapping.isSource) {
            onOpen();
            try {
                const data = await pullRemoteData(
                    programMapping,
                    goData,
                    tokens,
                    token,
                    remoteAPI
                );
                dataApi.changeData(data);
            } catch (error: any) {
                toast({
                    title: "Fetch Failed",
                    description: error.message,
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                });
            }
            onClose();
        }
    };
    useEffect(() => {
        if (
            data.length === 0 &&
            ["api", "go-data"].indexOf(programMapping.dataSource || "") !==
                -1 &&
            programMapping.prefetch
        ) {
            fetchRemoteData();
        }
    }, []);

    const determineFeatureType = () => {
        if (program.featureType === "POINT") {
            return (
                <Stack>
                    <Checkbox
                        isChecked={
                            programMapping.program?.enrollmentGeometryMerged
                        }
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "program",
                                path: "enrollmentGeometryMerged",
                                value: e.target.checked,
                            })
                        }
                    >
                        Enrollment Latitudes and Longitudes combined
                    </Checkbox>

                    {programMapping.program?.enrollmentGeometryMerged ? (
                        <Stack
                            alignItems="center"
                            flex={1}
                            direction="row"
                            spacing="20px"
                        >
                            <Text>
                                Enrollment Latitudes and Longitudes Column
                            </Text>
                            <Box flex={1}>
                                <Select<Option, false, GroupBase<Option>>
                                    value={metadata.sourceColumns.find(
                                        (val) =>
                                            val.value ===
                                            programMapping.program
                                                ?.enrollmentGeometryColumn
                                    )}
                                    options={metadata.sourceColumns}
                                    isClearable
                                    placeholder="Select tracked entity column"
                                    onChange={(e) =>
                                        mappingApi.update({
                                            attribute: "program",
                                            path: "enrollmentGeometryColumn",
                                            value: e?.value || "",
                                        })
                                    }
                                />
                            </Box>
                        </Stack>
                    ) : (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing="20px"
                            flex={1}
                        >
                            <Stack direction="row" alignItems="center" flex={1}>
                                <Text>Enrollment Latitude Column</Text>
                                <Box flex={1}>
                                    <Select<Option, false, GroupBase<Option>>
                                        value={metadata.sourceColumns.find(
                                            (val) =>
                                                val.value ===
                                                programMapping.program
                                                    ?.enrollmentLatitudeColumn
                                        )}
                                        options={metadata.sourceColumns}
                                        isClearable
                                        placeholder="Select latitude column"
                                        onChange={(e) =>
                                            mappingApi.update({
                                                attribute: "program",
                                                path: "enrollmentLatitudeColumn",
                                                value: e?.value || "",
                                            })
                                        }
                                    />
                                </Box>
                            </Stack>
                            <Stack direction="row" alignItems="center" flex={1}>
                                <Text>Enrollment Longitude Column</Text>
                                <Box flex={1}>
                                    <Select<Option, false, GroupBase<Option>>
                                        value={metadata.sourceColumns.find(
                                            (val) =>
                                                val.value ===
                                                programMapping.program
                                                    ?.enrollmentLongitudeColumn
                                        )}
                                        options={metadata.sourceColumns}
                                        isClearable
                                        placeholder="Select longitude column"
                                        onChange={(e) =>
                                            mappingApi.update({
                                                attribute: "program",
                                                path: "enrollmentLongitudeColumn",
                                                value: e?.value || "",
                                            })
                                        }
                                    />
                                </Box>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            );
        }

        if (program.featureType === "POLYGON") {
            return (
                <Stack
                    alignItems="center"
                    flex={1}
                    direction="row"
                    spacing="20px"
                >
                    <Text>Geometry</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={metadata.sourceColumns.find(
                                (val) =>
                                    val.value ===
                                    programMapping.program
                                        ?.enrollmentGeometryColumn
                            )}
                            options={metadata.sourceColumns}
                            isClearable
                            placeholder="Select geometry column"
                            onChange={(e) =>
                                mappingApi.update({
                                    attribute: "program",
                                    path: "enrollmentGeometryColumn",
                                    value: e?.value || "",
                                })
                            }
                        />
                    </Box>
                </Stack>
            );
        }
        return null;
    };
    return (
        <Stack spacing="30px">
            {!programMapping.isSource && (
                <CheckSelect
                    otherField="customOrgUnitColumn"
                    field="orgUnitColumn"
                    label="Organisation Unit Column"
                />
            )}
            {!programMapping.isSource && (
                <Stack spacing={[1, 5]} direction={["column", "row"]}>
                    <Checkbox
                        colorScheme="green"
                        isChecked={programMapping.program?.createEntities}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "program",
                                path: "createEntities",
                                value: e.target.checked,
                            })
                        }
                    >
                        Create Entities
                    </Checkbox>
                    <Checkbox
                        colorScheme="green"
                        isChecked={programMapping.program?.createEnrollments}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "program",
                                path: "createEnrollments",
                                value: e.target.checked,
                            })
                        }
                    >
                        Create Enrollments
                    </Checkbox>
                    <Checkbox
                        colorScheme="green"
                        isChecked={programMapping.program?.updateEntities}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "program",
                                path: "updateEntities",
                                value: e.target.checked,
                            })
                        }
                    >
                        Update Entities
                    </Checkbox>
                </Stack>
            )}

            {!programMapping.isSource && (
                <>
                    <CheckSelect2
                        otherField="customEnrollmentDateColumn"
                        field="enrollmentDateColumn"
                        label="Enrollment Date Column"
                    />
                    <CheckSelect2
                        otherField="customIncidentDateColumn"
                        field="incidentDateColumn"
                        label="Incident Date Column"
                    />
                </>
            )}
            {determineFeatureType()}
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Pre Fetching Remote Data "
                onOpen={onOpen}
            />
        </Stack>
    );
}
