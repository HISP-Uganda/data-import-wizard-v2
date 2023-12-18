import { Box, Checkbox, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { DataSource, IMapping, Option } from "data-import-wizard-utils";
import { Event } from "effector";
import { ChangeEvent } from "react";
import APICredentials from "./APICredentials";
import CSVUpload from "./CSVUpload";
import ExcelUpload from "./fields/ExcelUpload";
import FileUpload from "./FileUpload";

export default function MappingDetails({
    importTypes,
    mapping,
    updater,
}: {
    importTypes: Option[];
    mapping: Partial<IMapping>;
    updater: Event<{ attribute: keyof IMapping; value: any; key?: string }>;
}) {
    const getData = (
        dataSource: DataSource | undefined,
        extraction?: "cell" | "column" | "json"
    ) => {
        const options = {
            api: (
                <APICredentials<IMapping>
                    updateMapping={updater}
                    mapping={mapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            ),
            "xlsx-line-list": mapping.isSource ? null : (
                <ExcelUpload
                    mapping={mapping}
                    extraction={extraction ? extraction : "json"}
                    updater={updater}
                />
            ),
            "csv-line-list": mapping.isSource ? null : (
                <ExcelUpload
                    mapping={mapping}
                    extraction="json"
                    updater={updater}
                />
            ),
            "xlsx-tabular-data": mapping.isSource ? null : (
                <ExcelUpload
                    mapping={mapping}
                    extraction={extraction ? extraction : "json"}
                    updater={updater}
                />
            ),
            "xlsx-form": mapping.isSource ? null : (
                <ExcelUpload
                    mapping={mapping}
                    extraction="cell"
                    updater={updater}
                />
            ),
            csv: mapping.isSource ? null : <CSVUpload />,
            json: mapping.isSource ? null : (
                <FileUpload type="json" mapping={mapping} extraction="json" />
            ),
            "dhis2-data-set": (
                <APICredentials<IMapping>
                    updateMapping={updater}
                    mapping={mapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            ),
            "dhis2-indicators": (
                <APICredentials<IMapping>
                    updateMapping={updater}
                    mapping={mapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            ),
            "dhis2-program-indicators": (
                <APICredentials<IMapping>
                    updateMapping={updater}
                    mapping={mapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            ),
            "manual-dhis2-program-indicators": (
                <APICredentials<IMapping>
                    updateMapping={updater}
                    mapping={mapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            ),
            "dhis2-program": (
                <APICredentials<IMapping>
                    updateMapping={updater}
                    mapping={mapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            ),
            "go-data": (
                <APICredentials<IMapping>
                    updateMapping={updater}
                    mapping={mapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            ),
        };

        if (dataSource) {
            return options[dataSource];
        }
        return null;
    };
    return (
        <Stack
            spacing="30px"
            h="calc(100vh - 370px)"
            maxH="calc(100vh - 370px)"
            overflow="auto"
        >
            <Stack>
                <Text>Name</Text>
                <Input
                    value={mapping.name}
                    placeholder="Name of mapping"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updater({
                            attribute: "name",
                            value: e.target.value,
                        })
                    }
                />
            </Stack>
            <Stack>
                <Text>Description</Text>
                <Textarea
                    placeholder="Description of mapping"
                    value={mapping.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        updater({
                            attribute: "description",
                            value: e.target.value,
                        })
                    }
                />
            </Stack>
            <Checkbox
                isChecked={mapping.isSource}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    updater({
                        attribute: "isSource",
                        value: e.target.checked,
                    });
                }}
            >
                Current DHIS2 Instance is Source
            </Checkbox>
            <Stack>
                <Text>
                    {mapping.isSource ? "Export Data To" : "Import From"}
                </Text>
                <Stack direction="row" w="30%" spacing="30px">
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={importTypes.find(
                                (pt) => pt.value === mapping.dataSource
                            )}
                            onChange={(e) => {
                                updater({
                                    attribute: "dataSource",
                                    value: e?.value,
                                });

                                if (e && e.value === "go-data") {
                                    updater({
                                        attribute: "authentication",
                                        value: true,
                                        key: "basicAuth",
                                    });
                                    if (mapping.isSource) {
                                        updater({
                                            attribute: "program",
                                            value: "CASE",
                                            key: "responseKey",
                                        });
                                    }
                                }
                            }}
                            options={importTypes}
                            isClearable
                        />
                    </Box>
                    {mapping.dataSource &&
                        ["xlsx-line-list", "xlsx-tabular-data"].indexOf(
                            mapping.dataSource
                        ) !== -1 && (
                            <Checkbox
                                isChecked={mapping.useColumnLetters}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    updater({
                                        attribute: "useColumnLetters",
                                        value: e.target.checked,
                                    })
                                }
                            >
                                Use column letters
                            </Checkbox>
                        )}
                </Stack>
                {mapping.dataSource &&
                    [
                        "dhis2-data-set",
                        "dhis2-indicators",
                        "dhis2-program-indicators",
                        "manual-dhis2-program-indicators",
                        "dhis2-program",
                    ].indexOf(mapping.dataSource) !== -1 && (
                        <Checkbox
                            isChecked={mapping.isCurrentInstance}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updater({
                                    attribute: "isCurrentInstance",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Use current DHIS2 Instance
                        </Checkbox>
                    )}
            </Stack>

            {getData(
                mapping.isCurrentInstance &&
                    [
                        "dhis2-data-set",
                        "dhis2-indicators",
                        "dhis2-program-indicators",
                        "manual-dhis2-program-indicators",
                        "dhis2-program",
                    ].indexOf(mapping.dataSource ?? "") !== -1
                    ? undefined
                    : mapping.dataSource,
                mapping.useColumnLetters ? "column" : undefined
            )}
        </Stack>
    );
}
