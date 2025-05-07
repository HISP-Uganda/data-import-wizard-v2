import { Box, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { IProgram } from "data-import-wizard-utils";
import { isEmpty } from "lodash";
import { useState } from "react";
import { usePrograms } from "../../Queries";
import Loader from "../Loader";
import PivotQuery from "./PivotQuery";

export default function Pivot() {
    const { isLoading, isError, isSuccess, error, data } = usePrograms(1, 100);
    const [program, setProgram] = useState<Partial<IProgram>>({});

    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    overflow="auto"
                    whiteSpace="nowrap"
                    h="calc(100vh - 350px)"
                >
                    {isLoading && (
                        <Loader message="Loading DHIS2 programs..." />
                    )}
                    {isSuccess && (
                        <Stack>
                            <Box zIndex={100}>
                                <Select<
                                    Partial<IProgram>,
                                    false,
                                    GroupBase<Partial<IProgram>>
                                >
                                    options={data.programs}
                                    isClearable
                                    getOptionLabel={(d) => d.name ?? ""}
                                    getOptionValue={(d) => d.id ?? ""}
                                    value={program}
                                    onChange={(e) => setProgram(() => e ?? {})}
                                />
                            </Box>

                            {!isEmpty(program) ? (
                                <PivotQuery program={program.id ?? ""} />
                            ) : (
                                <Text>Select Program to begin</Text>
                            )}
                        </Stack>
                    )}
                    {isError && JSON.stringify(error)}
                </Box>
            </Box>
        </Stack>
    );
}
