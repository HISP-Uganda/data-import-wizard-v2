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
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect } from "react";
import { Option, IProgramMapping } from "diw-utils";
import {
    $columns,
    $data,
    $goData,
    $metadata,
    $programMapping,
    $remoteAPI,
    dataApi,
    programMappingApi,
} from "../../pages/program/Store";
import Progress from "../Progress";

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

    const isManual = !programMapping.isDHIS2 && programMapping.isSource;

    return (
        <Stack spacing="10px">
            <Text w="200px">{label}</Text>
            <Stack direction="row">
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
                        Manually Map {label}
                    </Checkbox>
                )}
                <Box flex={1}>
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
                            flex={1}
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
    );
};

export default function Step10() {
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($programMapping);
    const data = useStore($data);
    const remoteAPI = useStore($remoteAPI);
    const goData = useStore($goData);

    const fetchRemoteData = async () => {
        if (remoteAPI && !programMapping.isSource) {
            onOpen();
            try {
                if (programMapping.dataSource === "godata" && goData.id) {
                    const { data } = await remoteAPI.get(
                        `api/outbreaks/${goData.id}/cases`
                    );
                    dataApi.changeData(data);
                } else {
                    const { data } = await remoteAPI.get("");
                    dataApi.changeData(data);
                }
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
        <Stack spacing="20px">
            {!programMapping.isDHIS2 && (
                <CheckSelect
                    otherField="manuallyMapOrgUnitColumn"
                    field="orgUnitColumn"
                    label="Organisation Unit Column"
                />
            )}
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

            <CheckSelect
                otherField="manuallyMapEnrollmentDateColumn"
                field="enrollmentDateColumn"
                label="Enrollment Date Column"
            />
            <CheckSelect
                otherField="manuallyMapIncidentDateColumn"
                field="incidentDateColumn"
                label="Incident Date Column"
            />
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Pre Fetching Remote Data "
                onOpen={onOpen}
            />
        </Stack>
    );
}
