import { Box, Checkbox, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { GroupBase, Select, SingleValue } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { mappingApi } from "../Events";
import { $mapping } from "../Store";
import { InitialMapping } from "./InitialMapping";

export default function MappingDetails({
    importTypes,
}: {
    importTypes: Option[];
}) {
    const mapping = useStore($mapping);
    const onSelect = (e: SingleValue<Option>) => {
        mappingApi.update({
            attribute: "dataSource",
            value: e?.value,
        });
        if (e && e.value === "dhis2-program") {
        } else if (e && e.value === "go-data") {
            mappingApi.update({
                attribute: "authentication",
                value: true,
                path: "basicAuth",
            });
            if (mapping.isSource) {
                mappingApi.update({
                    attribute: "program",
                    value: "CASE",
                    path: "responseKey",
                });
            }
        }
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
                    value={mapping.name ?? ""}
                    placeholder="Name of mapping"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        mappingApi.update({
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
                    value={mapping.description ?? ""}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        mappingApi.update({
                            attribute: "description",
                            value: e.target.value,
                        })
                    }
                />
            </Stack>
            <Checkbox
                isChecked={mapping.isSource}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    mappingApi.update({
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
                            onChange={(e) => onSelect(e)}
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
                                    mappingApi.update({
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
                                mappingApi.update({
                                    attribute: "isCurrentInstance",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Use current DHIS2 Instance
                        </Checkbox>
                    )}
            </Stack>

            <InitialMapping
                isSource={mapping.isSource}
                dataSource={
                    mapping.isCurrentInstance &&
                    [
                        "dhis2-data-set",
                        "dhis2-indicators",
                        "dhis2-program-indicators",
                        "manual-dhis2-program-indicators",
                        "dhis2-program",
                    ].indexOf(mapping.dataSource ?? "") !== -1
                        ? undefined
                        : mapping.dataSource
                }
                extraction={mapping.useColumnLetters ? "column" : undefined}
            />

            {/* {getData(
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
            )} */}
            <pre>{JSON.stringify(mapping, null, 2)}</pre>
        </Stack>
    );
}
