import { Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { Option } from "../../Interfaces";
import { updateMapping } from "../../pages/program/Events";
import { $programMapping } from "../../pages/program/Store";
import APICredentials from "../APICredentials";
import FileUpload from "../FileUpload";

const importTypes: Option[] = [
    { label: "api", value: "api" },
    { label: "xlsx", value: "xlsx" },
    { label: "csv", value: "csv" },
    { label: "json", value: "json" },
];

const Step2 = () => {
    const programMapping = useStore($programMapping);
    return (
        <Stack spacing="30px">
            <Stack>
                <Text>Mapping Name</Text>
                <Input
                    value={programMapping.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
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
                        updateMapping({
                            attribute: "description",
                            value: e.target.value,
                        })
                    }
                />
            </Stack>

            <Stack>
                <Text>Import Type</Text>
                <Select<Option, false, GroupBase<Option>>
                    value={importTypes.find(
                        (pt) => pt.value === programMapping.dataSource
                    )}
                    onChange={(e) =>
                        updateMapping({
                            attribute: "dataSource",
                            value: e?.value || "",
                        })
                    }
                    options={importTypes}
                    isClearable
                />
            </Stack>
            {programMapping.dataSource === "api" && (
                <APICredentials
                    updateMapping={updateMapping}
                    mapping={programMapping}
                />
            )}

            {programMapping.dataSource &&
                ["xlsx", "json", "csv"].indexOf(programMapping.dataSource) !==
                    -1 && <FileUpload />}
        </Stack>
    );
};

export default Step2;
