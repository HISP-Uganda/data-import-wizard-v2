import { Checkbox, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { $programMapping, programMappingApi } from "../../pages/program/Store";
import APICredentials from "../APICredentials";
import FileUpload from "../FileUpload";

const importTypes: Option[] = [
    { label: "api", value: "api" },
    { label: "xlsx", value: "xlsx" },
    { label: "csv", value: "csv" },
    { label: "json", value: "json" },
    { label: "dhis2", value: "dhis2" },
    { label: "godata", value: "godata" },
];

const Step2 = () => {
    const programMapping = useStore($programMapping);
    return (
        <Stack
            spacing="10px"
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            <Stack>
                <Text>Name</Text>
                <Input
                    value={programMapping.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        programMappingApi.update({
                            attribute: "name",
                            value: e.target.value,
                        })
                    }
                />
            </Stack>
            <Stack>
                <Text>Description</Text>
                <Textarea
                    value={programMapping.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        programMappingApi.update({
                            attribute: "description",
                            value: e.target.value,
                        })
                    }
                />
            </Stack>
            <Checkbox
                isChecked={programMapping.isSource}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    programMappingApi.updateMany({
                        isSource: e.target.checked,
                        prefetch: !e.target.checked,
                    });
                }}
            >
                Current DHIS2 Instance is Source
            </Checkbox>
            <Stack>
                <Text>
                    {programMapping.isSource ? "Export Data To" : "Import From"}
                </Text>
                <Select<Option, false, GroupBase<Option>>
                    value={importTypes.find(
                        (pt) => pt.value === programMapping.dataSource
                    )}
                    onChange={(e) => {
                        programMappingApi.update({
                            attribute: "dataSource",
                            value: e?.value || "",
                        });

                        if (e?.value === "api") {
                        }
                    }}
                    options={importTypes}
                    isClearable
                />
            </Stack>
            {["api", "godata", "dhis2"].indexOf(
                programMapping.dataSource || ""
            ) !== -1 && (
                <APICredentials
                    updateMapping={programMappingApi.update}
                    mapping={programMapping}
                    accessor="authentication"
                    displayDHIS2Options
                />
            )}

            {programMapping.dataSource &&
                ["xlsx", "json", "csv"].indexOf(programMapping.dataSource) !==
                    -1 && <FileUpload />}
        </Stack>
    );
};

export default Step2;
