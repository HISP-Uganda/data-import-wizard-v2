import { Checkbox, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Input } from "antd";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect } from "react";
import { CQIDexie } from "../db";
import { mappingApi, ouMappingApi, remoteOrganisationsApi } from "../Events";
import { getDHIS2Resource } from "../Queries";
import { $mapping, $metadata, $organisationUnitMapping } from "../Store";
import FileUpload from "./FileUpload";
import GenericMapping from "./GenericMapping";
import InfoMapping from "./InfoMapping";
import Progress from "./Progress";
export default function OrganisationUnitMapping({ db }: { db: CQIDexie }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const engine = useDataEngine();
    const mapping = useStore($mapping);
    const metadata = useStore($metadata);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const {
        customOrgUnitColumn = false,
        orgUnitColumn = "",
        matchHierarchy = false,
    } = mapping.orgUnitMapping ?? {};

    const fetchOrganisationsByLevel = async () => {
        onOpen();
        if (mapping.aggregate?.indicatorGenerationLevel) {
            db.messages.put({
                message: "Fetching organisation units",
                id: 1,
            });
            const { organisationUnits: units } = await getDHIS2Resource<{
                organisationUnits: Array<Option>;
            }>({
                isCurrentDHIS2: mapping.isCurrentInstance,
                engine,
                resource: "organisationUnits.json",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    level: mapping.aggregate.indicatorGenerationLevel,
                    paging: "false",
                },
                auth: mapping.authentication,
            });
            remoteOrganisationsApi.set(units);
        }
        onClose();
    };

    useEffect(() => {
        if (
            mapping.dataSource === "dhis2-program" ||
            mapping.dataSource === "dhis2-data-set"
        ) {
            mappingApi.updateMany({
                orgUnitMapping: {
                    ...mapping.orgUnitMapping,
                    orgUnitColumn: "orgUnit",
                },
            });
        }
        return () => {};
    }, []);

    useEffect(() => {
        fetchOrganisationsByLevel();
        return () => {};
    }, []);

    return (
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
            spacing="20px"
        >
            <Stack direction="row" alignItems="center" spacing="30px">
                {[
                    "dhis2-program-indicators",
                    "dhis2-indicators",
                    "dhis2-data-set",
                    "dhis2-program",
                    "manual-dhis2-program-indicators",
                    "fhir",
                    "go-data",
                ].indexOf(mapping.dataSource ?? "") === -1 && (
                    <InfoMapping
                        value={orgUnitColumn}
                        isChecked={customOrgUnitColumn}
                        title="Organisation Column"
                        isMulti
                        title2="Custom Organisation Column"
                        onCustomChange={(customOrgUnitColumn) => {
                            mappingApi.updateMany({
                                orgUnitMapping: {
                                    ...mapping.orgUnitMapping,
                                    customOrgUnitColumn,
                                },
                            });
                        }}
                        onValueChange={(orgUnitColumn) => {
                            mappingApi.updateMany({
                                orgUnitMapping: {
                                    ...mapping.orgUnitMapping,
                                    orgUnitColumn,
                                },
                            });
                        }}
                    >
                        <Checkbox
                            isChecked={matchHierarchy}
                            onChange={(e) =>
                                mappingApi.updateMany({
                                    orgUnitMapping: {
                                        ...mapping.orgUnitMapping,
                                        matchHierarchy: e.target.checked,
                                    },
                                })
                            }
                        >
                            Match Hierarchy
                        </Checkbox>
                    </InfoMapping>
                )}

                {["fhir"].indexOf(mapping.dataSource ?? "") !== -1 && (
                    <Stack>
                        <FileUpload
                            type="xlsx"
                            extraction="json"
                            onDataChange={remoteOrganisationsApi.set}
                            fileUploadLabel="Upload Excel Organisation File"
                        />
                        <Stack>
                            <Text>Label Field</Text>
                            <Input
                                value={mapping.remoteOrgUnitLabelField}
                                onChange={(e) =>
                                    mappingApi.updateMany({
                                        remoteOrgUnitLabelField: e.target.value,
                                    })
                                }
                            />
                        </Stack>
                        <Stack>
                            <Text>Value Field</Text>
                            <Input
                                value={mapping.remoteOrgUnitValueField}
                                onChange={(e) =>
                                    mappingApi.updateMany({
                                        remoteOrgUnitValueField: e.target.value,
                                    })
                                }
                            />
                        </Stack>
                    </Stack>
                )}
            </Stack>
            <GenericMapping
                destinationOptions={metadata.destinationOrgUnits}
                sourceOptions={metadata.sourceOrgUnits}
                isMulti
                updater={ouMappingApi.updateMany}
                mapped={organisationUnitMapping}
                db={db}
                merger={ouMappingApi.merge}
                isOrgUnitMapping={true}
            />
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
