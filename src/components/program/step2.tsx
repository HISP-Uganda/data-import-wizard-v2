import { Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { Option } from "../../Interfaces";
import { updateMapping } from "../../pages/program/Events";
import { $program } from "../../pages/program/Store";
import APICredentials from "../APICredentials";

const importTypes: Option[] = [
    { label: "api", value: "api" },
    { label: "xlsx", value: "xlsx" },
    { label: "csv", value: "csv" },
];

const Step2 = () => {
    const program = useStore($program);
    return (
        <Stack spacing="30px">
            <Stack>
                <Text>Mapping Name</Text>
                <Input
                    value={program.name}
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
                    value={program.description}
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
                        (pt) => pt.value === program.dataSource
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
            {program.dataSource === "api" && (
                <APICredentials
                    updateMapping={updateMapping}
                    mapping={program}
                />
            )}
            <pre>{JSON.stringify(program, null, 2)}</pre>
        </Stack>
    );
};

export default Step2;
