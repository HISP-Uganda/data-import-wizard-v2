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
    Option,
    pullRemoteData,
    IProgramMapping,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect } from "react";
import {
    $data,
    $goData,
    $metadata,
    $programMapping,
    $remoteAPI,
    $token,
    $tokens,
    dataApi,
    programMappingApi,
} from "../../pages/program";
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
    const programMapping = useStore($programMapping);
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
                                programMappingApi.update({
                                    attribute: "program",
                                    key: otherField,
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
                                        getOr("", field, programMapping)
                                    );
                                })}
                                onChange={(e) =>
                                    programMappingApi.update({
                                        attribute: "program",
                                        key: field,
                                        value: e?.value || "",
                                    })
                                }
                            />
                        ) : (
                            <Input
                                value={String(getOr("", field, programMapping))}
                                onChange={(e) =>
                                    programMappingApi.update({
                                        attribute: "program",
                                        key: field,
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
    const programMapping = useStore($programMapping);
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
                                programMappingApi.update({
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
                                    programMappingApi.update({
                                        attribute: field,
                                        value: e?.value || "",
                                    })
                                }
                            />
                        ) : (
                            <Input
                                value={String(getOr("", field, programMapping))}
                                onChange={(e) =>
                                    programMappingApi.update({
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
    const programMapping = useStore($programMapping);
    const data = useStore($data);
    const remoteAPI = useStore($remoteAPI);
    const goData = useStore($goData);
    const token = useStore($token);
    const tokens = useStore($tokens);

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
                            programMappingApi.update({
                                attribute: "program",
                                key: "createEntities",
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
                            programMappingApi.update({
                                attribute: "program",
                                key: "createEnrollments",
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
                            programMappingApi.update({
                                attribute: "program",
                                key: "updateEntities",
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
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Pre Fetching Remote Data "
                onOpen={onOpen}
            />
        </Stack>
    );
}
