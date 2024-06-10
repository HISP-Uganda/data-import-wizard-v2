import {
    Box,
    Checkbox,
    Input,
    Stack,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { mappingApi } from "../../Events";
import { $mapping } from "../../Store";

export default function DHIS2ToDHIS2ProgramOptions() {
    const mapping = useStore($mapping);
    return (
        <Stack>
            <Stack spacing={[1, 5]} direction={["column", "row"]}>
                <Checkbox
                    colorScheme="green"
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
                    colorScheme="green"
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
                    colorScheme="green"
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
        </Stack>
    );
}
