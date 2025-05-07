import { Box, Checkbox, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import {
    IProgramStageDataElement,
    Mapping,
    Option,
    RealMapping,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { orderBy } from "lodash";
import { ChangeEvent } from "react";
import { CQIDexie } from "../db";
import { mappingApi, stageMappingApi } from "../Events";
import { $mapping, $metadata, $programStageMapping } from "../Store";
import GenericMapping from "./GenericMapping";
import InfoMapping from "./InfoMapping";

export default function ProgramStageMapping({
    psId,
    programStageDataElements,
    featureType,
    db,
}: {
    psId: string;
    programStageDataElements: IProgramStageDataElement[];
    featureType: string;
    db: CQIDexie;
}) {
    const mapping = useStore($mapping);
    const metadata = useStore($metadata);
    const programStageMapping = useStore($programStageMapping);
    const stageMapping: Mapping =
        programStageMapping.get(psId) ??
        new Map<string, Partial<RealMapping>>();
    const dataElements: Option[] = orderBy(
        programStageDataElements.map(
            ({
                dataElement: { id, name, optionSetValue, optionSet },
                compulsory,
            }) => {
                return {
                    label: name,
                    value: id,
                    optionSetValue: optionSetValue || false,
                    id,
                    stage: psId,
                    mandatory: compulsory,
                    availableOptions:
                        optionSet?.options.map(({ code, id, name }) => ({
                            label: name,
                            code,
                            value: code,
                            id,
                        })) || [],
                };
            },
        ),
        ["mandatory"],
        ["desc"],
    );
    const info = mapping.eventStageMapping?.get(psId) || {};
    const {
        createEvents = false,
        updateEvents = false,
        uniqueEventDate = false,
        createEmptyEvents = false,
        customEventIdColumn = false,
        customEventDateColumn = false,
        customDueDateColumn = false,
        customGeometryColumn = false,
        completeEvents = false,
        eventDateColumn = "",
        dueDateColumn = "",
        eventIdColumn = "",
        geometryColumn = "",
        specificStage,
    } = info;

    const onCreateEvents = (e: ChangeEvent<HTMLInputElement>) => {
        mappingApi.updateStage({
            stage: psId,
            update: { createEvents: e.target.checked },
        });
    };

    const onUpdateEvents = (e: ChangeEvent<HTMLInputElement>) => {
        mappingApi.updateStage({
            stage: psId,
            update: { updateEvents: e.target.checked },
        });
    };

    return (
        <Stack key={psId} spacing="20px">
            <Stack direction="row" spacing="20px" alignItems="center">
                {mapping.dataSource === "dhis2-program" && (
                    <Stack flex={1} h="100%">
                        <Text>Specific Stage</Text>
                        <Box flex={1}>
                            <Select<Option, false, GroupBase<Option>>
                                value={metadata.destinationStages.find(
                                    (val) => val.value === specificStage,
                                )}
                                options={metadata.destinationStages}
                                isClearable
                                onChange={(e) => {
                                    mappingApi.updateStage({
                                        stage: psId,
                                        update: {
                                            specificStage: e?.value || "",
                                        },
                                    });
                                    if (e) {
                                        mappingApi.updateStage({
                                            stage: psId,
                                            update: {
                                                specificStage: e?.value,
                                                eventDateColumn: `${e.value}.eventDate`,
                                                dueDateColumn: `${e.value}.dueDate`,
                                                eventIdColumn: `${e.value}.event`,
                                            },
                                        });
                                    }
                                }}
                            />
                        </Box>
                    </Stack>
                )}

                <InfoMapping
                    value={eventDateColumn}
                    isChecked={customEventDateColumn}
                    title="Event Date Column"
                    title2="Custom Event Date Column"
                    onCustomChange={(customEventDateColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { customEventDateColumn },
                        });
                    }}
                    onValueChange={(eventDateColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { eventDateColumn },
                        });
                    }}
                />

                <InfoMapping
                    value={dueDateColumn}
                    isChecked={customDueDateColumn}
                    title="Due Date Column"
                    title2="Custom Due Date Column"
                    onCustomChange={(customDueDateColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { customDueDateColumn },
                        });
                    }}
                    onValueChange={(dueDateColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { dueDateColumn },
                        });
                    }}
                />

                <InfoMapping
                    value={eventIdColumn}
                    isChecked={customEventIdColumn}
                    title="Event Id Column"
                    title2="Custom Event Id Column"
                    onCustomChange={(customEventIdColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { customEventIdColumn },
                        });
                    }}
                    onValueChange={(eventIdColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { eventIdColumn },
                        });
                    }}
                />
            </Stack>
            <Stack spacing={[1, 5]} direction={["column", "row"]}>
                <Checkbox
                    colorScheme="green"
                    isChecked={createEvents}
                    onChange={onCreateEvents}
                >
                    Create Events
                </Checkbox>

                <Checkbox
                    colorScheme="green"
                    isChecked={updateEvents}
                    onChange={onUpdateEvents}
                >
                    Update Events
                </Checkbox>

                <Checkbox
                    colorScheme="green"
                    isChecked={completeEvents}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { completeEvents: e.target.checked },
                        });
                    }}
                >
                    Complete Events
                </Checkbox>
                <Checkbox
                    colorScheme="green"
                    isChecked={uniqueEventDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { uniqueEventDate: e.target.checked },
                        });
                    }}
                >
                    Mark Event Date As Unique
                </Checkbox>
                <Checkbox
                    colorScheme="green"
                    isChecked={createEmptyEvents}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { createEmptyEvents: e.target.checked },
                        });
                    }}
                >
                    Create Empty Events
                </Checkbox>
            </Stack>
            {featureType && featureType !== "NONE" && (
                <InfoMapping
                    value={geometryColumn}
                    isChecked={customGeometryColumn}
                    title="Geometry Column"
                    title2="Custom Geometry Column"
                    isMulti
                    onCustomChange={(customGeometryColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { customGeometryColumn },
                        });
                    }}
                    onValueChange={(geometryColumn) => {
                        mappingApi.updateStage({
                            stage: psId,
                            update: { geometryColumn },
                        });
                    }}
                />
            )}
            <GenericMapping
                destinationOptions={dataElements}
                sourceOptions={metadata.sourceColumns}
                stage={psId}
                mapped={stageMapping}
                updater={stageMappingApi.updateMany}
                db={db}
                merger={stageMappingApi.merge}
            />
        </Stack>
    );
}
