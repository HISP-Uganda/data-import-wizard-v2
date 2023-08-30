import { Box, Spinner, Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { ColumnDef } from "@tanstack/react-table";
import { IProgram } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { useMemo } from "react";
import {
    $programMapping,
    programApi,
    programMappingApi,
} from "../../pages/program/Store";
import { loadProgram, usePrograms } from "../../Queries";
import { stepper } from "../../Store";
import Progress from "../Progress";
import TableDisplay from "../TableDisplay";

const Step1 = () => {
    const { isLoading, isError, isSuccess, error, data } = usePrograms(1, 100);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const engine = useDataEngine();
    const programMapping = useStore($programMapping);
    const columns = useMemo<ColumnDef<Partial<IProgram>>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                size: 20,
            },
            {
                accessorKey: "name",
                header: "Name",
                size: 20,
            },
            {
                accessorKey: "programType",
                header: "Program Type",
            },
        ],
        []
    );

    const onProgramSelect = async (id: string) => {
        onOpen();
        let data = await loadProgram(engine, id);
        const other = programMapping.isSource
            ? { source: data.name }
            : { destination: data.name };
        programMappingApi.updateMany({
            trackedEntityType: getOr("", "trackedEntityType.id", data),
            program: id,
            programType: getOr("", "programType", data),
            ...other,
        });
        programApi.set(data);
        onClose();
        stepper.next();
    };
    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    position="relative"
                    overflow="auto"
                    whiteSpace="nowrap"
                    h="calc(100vh - 350px)"
                >
                    {isLoading && (
                        <Stack
                            h="100%"
                            alignItems="center"
                            justifyContent="center"
                            justifyItems="center"
                            alignContent="center"
                        >
                            <Spinner />
                        </Stack>
                    )}
                    {isLoading && <Spinner />}
                    {isSuccess && (
                        <TableDisplay<Partial<IProgram>>
                            generatedData={data.programs}
                            columns={columns}
                            onRowClick={onProgramSelect}
                            queryKey={["step2"]}
                            selected={programMapping.program}
                        />
                    )}
                    {isError && JSON.stringify(error)}
                </Box>
            </Box>

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Loading Selected Program"
                onOpen={onOpen}
            />
        </Stack>
    );
};

export default Step1;
