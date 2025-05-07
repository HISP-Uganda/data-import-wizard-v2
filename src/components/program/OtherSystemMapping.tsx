import {
	Box,
	Stack,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect } from "react";
import { CQIDexie } from "../../db";
import { attributeMappingApi, mappingApi } from "../../Events";
import { $attributeMapping, $mapping, $metadata } from "../../Store";
import GenericMapping from "../GenericMapping";

export function OtherSystemMapping({ db }: { db: CQIDexie }) {
    const metadata = useStore($metadata);
    const mapping = useStore($mapping);
    const attributeMapping = useStore($attributeMapping);
    const entityOptions: Option[] = [
        { label: "Case", value: "CASE" },
        { label: "Contact", value: "CONTACT" },
        { label: "Event", value: "EVENT" },
    ];

    useEffect(() => {
        if (mapping.dataSource === "go-data" && !mapping.program?.responseKey) {
            mappingApi.update({
                attribute: "program",
                path: "responseKey",
                value: "CASE",
            });
        }
    }, []);
    if (mapping.dataSource === "go-data") {
        return (
            <Stack w="100%" h="100%">
                <Stack direction="row" alignItems="center">
                    <Text>Entity</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={entityOptions.find(
                                (val) =>
                                    val.value === mapping.program?.responseKey,
                            )}
                            options={entityOptions}
                            isClearable
                            placeholder="Select"
                            onChange={(e) =>
                                mappingApi.update({
                                    attribute: "program",
                                    path: "responseKey",
                                    value: e?.value,
                                })
                            }
                        />
                    </Box>
                </Stack>

                {mapping.program?.responseKey === "EVENT" ? (
                    <GenericMapping
                        destinationOptions={metadata.events}
                        sourceOptions={metadata.sourceColumns}
                        mapped={attributeMapping}
                        updater={attributeMappingApi.updateMany}
                        db={db}
                        merger={attributeMappingApi.merge}
                    />
                ) : (
                    <Tabs>
                        <TabList>
                            <Tab>Personal</Tab>
                            <Tab>Epidemiology</Tab>
                            <Tab>Questionnaire</Tab>
                            {mapping.program?.responseKey === "CONTACT" && (
                                <Tab>Relationship</Tab>
                            )}
                            <Tab>Lab</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <GenericMapping
                                    destinationOptions={
                                        mapping.program?.responseKey ===
                                        "CONTACT"
                                            ? metadata.contact
                                            : metadata.case
                                    }
                                    sourceOptions={metadata.sourceColumns}
                                    mapped={attributeMapping}
                                    updater={attributeMappingApi.updateMany}
                                    db={db}
                                    merger={attributeMappingApi.merge}
                                />
                            </TabPanel>
                            <TabPanel>
                                <GenericMapping
                                    destinationOptions={metadata.epidemiology}
                                    sourceOptions={metadata.sourceColumns}
                                    mapped={attributeMapping}
                                    updater={attributeMappingApi.updateMany}
                                    db={db}
                                    merger={attributeMappingApi.merge}
                                />
                            </TabPanel>
                            <TabPanel>
                                <GenericMapping
                                    destinationOptions={metadata.questionnaire}
                                    sourceOptions={metadata.sourceColumns}
                                    mapped={attributeMapping}
                                    updater={attributeMappingApi.updateMany}
                                    db={db}
                                    merger={attributeMappingApi.merge}
                                />
                            </TabPanel>
                            {mapping.program?.responseKey === "CONTACT" && (
                                <TabPanel>
                                    <GenericMapping
                                        destinationOptions={
                                            metadata.relationship
                                        }
                                        sourceOptions={metadata.sourceColumns}
                                        mapped={attributeMapping}
                                        updater={attributeMappingApi.updateMany}
                                        db={db}
                                        merger={attributeMappingApi.merge}
                                    />
                                </TabPanel>
                            )}
                            <TabPanel>
                                <GenericMapping
                                    destinationOptions={metadata.lab}
                                    sourceOptions={metadata.sourceColumns}
                                    mapped={attributeMapping}
                                    updater={attributeMappingApi.updateMany}
                                    db={db}
                                    merger={attributeMappingApi.merge}
                                />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                )}
            </Stack>
        );
    }

    return (
        <GenericMapping
            destinationOptions={metadata.destinationColumns}
            sourceOptions={metadata.sourceColumns}
            mapped={attributeMapping}
            updater={attributeMappingApi.updateMany}
            db={db}
            merger={attributeMappingApi.merge}
        />
    );
}
