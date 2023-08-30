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
    IProgramMapping,
    Option,
    fetchRemote,
    pullRemoteData,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { fromPairs, isArray, isString } from "lodash";
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
} from "../../pages/program/Store";
import Progress from "../Progress";
import DHIS2Options from "./DHIS2Options";

const CheckSelect = ({
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
        programMapping.dataSource !== "dhis2" && programMapping.isSource;

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

export default function Step10() {
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
            ["api", "godata"].indexOf(programMapping.dataSource || "") !== -1 &&
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
                        isChecked={programMapping.createEntities}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            programMappingApi.update({
                                attribute: "createEntities",
                                value: e.target.checked,
                            })
                        }
                    >
                        Create Entities
                    </Checkbox>
                    <Checkbox
                        colorScheme="green"
                        isChecked={programMapping.createEnrollments}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            programMappingApi.update({
                                attribute: "createEnrollments",
                                value: e.target.checked,
                            })
                        }
                    >
                        Create Enrollments
                    </Checkbox>
                    <Checkbox
                        colorScheme="green"
                        isChecked={programMapping.updateEntities}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            programMappingApi.update({
                                attribute: "updateEntities",
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
                    <CheckSelect
                        otherField="customEnrollmentDateColumn"
                        field="enrollmentDateColumn"
                        label="Enrollment Date Column"
                    />
                    <CheckSelect
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
