import { Box, Checkbox, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { CQIDexie } from "../db";
import { mappingApi } from "../Events";
import { $mapping, $program } from "../Store";
import { InitialMapping } from "./InitialMapping";
import { Select } from "antd";

export default function MappingDetails({
    importTypes,
}: {
    importTypes: Option[];
    db: CQIDexie;
}) {
    const mapping = useStore($mapping);
    const program = useStore($program);
    const onSelect = (e: string | undefined) => {
        mappingApi.update({
            attribute: "dataSource",
            value: e,
        });
        if (e && e === "dhis2-program") {
        } else if (e && e === "go-data") {
            if (process.env.NODE_ENV === "development") {
                mappingApi.updateMany({
                    authentication: {
                        url: process.env.REACT_APP_GO_DATA_URL,
                        username: process.env.REACT_APP_GO_DATA_USERNAME,
                        password: process.env.REACT_APP_GO_DATA_PASSWORD,
                        basicAuth: true,
                    },
                    prefetch: true,
                });
            }
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
            <Stack direction="row" alignItems="center">
                <Text>
                    {mapping.isSource ? "Export Data To" : "Import From"}
                </Text>
                <Stack direction="row" w="30%" spacing="30px">
                    <Box flex={1}>
                        <Select
                            style={{ width: "100%" }}
                            value={mapping.dataSource}
                            onChange={(e) => onSelect(e)}
                            options={importTypes}
                            allowClear
                        />
                    </Box>
                    {mapping.dataSource &&
                        ["xlsx-line-list", "xlsx-tabular-data"].indexOf(
                            mapping.dataSource,
                        ) !== -1 &&
                        !mapping.isSource && (
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
            </Stack>
            {!mapping.isCurrentInstance && (
                <InitialMapping
                    dataSource={mapping.dataSource}
                    extraction={mapping.useColumnLetters ? "column" : "json"}
                />
            )}

            {mapping.type === "individual" && !mapping.isSource && (
                <Stack spacing="20px">
                    <Text>Preliminary Options</Text>
                    <Stack direction="row" spacing="20px">
                        <Checkbox
                            isChecked={mapping.program?.createEntities}
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
                            isChecked={mapping.program?.updateEntities}
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
                    <Stack direction="row" spacing="20px">
                        <Checkbox
                            isChecked={mapping.program?.createEnrollments}
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
                            isChecked={mapping.program?.updateEnrollments}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: "program",
                                    path: "updateEnrollments",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Update Enrollments
                        </Checkbox>
                    </Stack>
                    <Stack direction="row" spacing="20px">
                        <Checkbox
                            isChecked={mapping.program?.createEvents}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: "program",
                                    path: "createEvents",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Create Events
                        </Checkbox>
                        <Checkbox
                            isChecked={mapping.program?.updateEvents}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: "program",
                                    path: "updateEvents",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Update Events
                        </Checkbox>
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
}
