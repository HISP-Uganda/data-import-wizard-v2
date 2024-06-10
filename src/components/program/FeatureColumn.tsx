import { Box, Checkbox, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { stageMappingApi } from "../../Events";
import { $metadata, $programStageMapping } from "../../Store";
export default function FeatureColumn({
    psId,
    featureType,
}: {
    psId: string;
    featureType: string;
}) {
    const programStageMapping = useStore($programStageMapping);
    const metadata = useStore($metadata);
    const geometryMerged =
        programStageMapping[psId]?.["info"]?.geometryMerged || false;
    const geometryColumn =
        programStageMapping[psId]?.["info"]?.geometryColumn || "";
    const latitudeColumn =
        programStageMapping[psId]?.["info"]?.latitudeColumn || "";
    const longitudeColumn =
        programStageMapping[psId]?.["info"]?.longitudeColumn || "";

    if (featureType === "POINT") {
        return (
            <Stack>
                <Checkbox
                    isChecked={geometryMerged}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        stageMappingApi.update({
                            attribute: "info",
                            key: "geometryMerged",
                            stage: psId,
                            value: e.target.checked,
                        })
                    }
                >
                    Latitudes and Longitudes combined
                </Checkbox>

                {geometryMerged ? (
                    <Stack
                        alignItems="center"
                        flex={1}
                        direction="row"
                        spacing="20px"
                    >
                        <Text>Latitudes and Longitudes Column</Text>
                        <Box flex={1}>
                            <Select<Option, false, GroupBase<Option>>
                                value={metadata.sourceColumns.find(
                                    (val) => val.value === geometryColumn
                                )}
                                options={metadata.sourceColumns}
                                isClearable
                                placeholder="Select geometry column"
                                onChange={(e) =>
                                    stageMappingApi.update({
                                        attribute: "info",
                                        key: "geometryColumn",
                                        stage: psId,
                                        value: e?.value,
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
                            <Text>Latitude Column</Text>
                            <Box flex={1}>
                                <Select<Option, false, GroupBase<Option>>
                                    value={metadata.sourceColumns.find(
                                        (val) => val.value === latitudeColumn
                                    )}
                                    options={metadata.sourceColumns}
                                    isClearable
                                    placeholder="Select latitude column"
                                    onChange={(e) =>
                                        stageMappingApi.update({
                                            attribute: "info",
                                            key: "latitudeColumn",
                                            stage: psId,
                                            value: e?.value,
                                        })
                                    }
                                />
                            </Box>
                        </Stack>
                        <Stack direction="row" alignItems="center" flex={1}>
                            <Text>Longitude Column</Text>
                            <Box flex={1}>
                                <Select<Option, false, GroupBase<Option>>
                                    value={metadata.sourceColumns.find(
                                        (val) => val.value === longitudeColumn
                                    )}
                                    options={metadata.sourceAttributes}
                                    isClearable
                                    placeholder="Select longitude column"
                                    onChange={(e) =>
                                        stageMappingApi.update({
                                            attribute: "info",
                                            key: "longitudeColumn",
                                            stage: psId,
                                            value: e?.value,
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
    return null;
}
