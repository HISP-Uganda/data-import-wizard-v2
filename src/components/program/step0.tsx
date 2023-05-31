import { Spinner, Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { IProgramMapping } from "data-import-wizard-utils";
import {
    attributeMappingApi,
    optionMappingApi,
    ouMappingApi,
    programApi,
    programMappingApi,
    stageMappingApi,
} from "../../pages/program/Store";
import { loadPreviousMapping, loadProgram, useNamespace } from "../../Queries";
import { actionApi, stepper } from "../../Store";
import Progress from "../Progress";
import TableDisplay from "../TableDisplay";

const Step0 = () => {
    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const { isLoading, isSuccess, isError, error, data } =
        useNamespace<IProgramMapping>("iw-program-mapping");
    const loadMapping = async (namespaceKey: string) => {
        actionApi.edit();
        setMessage(() => "Fetching saved mapping");
        onOpen();
        const previousMappings = await loadPreviousMapping(
            engine,
            [
                "iw-program-mapping",
                "iw-ou-mapping",
                "iw-attribute-mapping",
                "iw-stage-mapping",
                "iw-option-mapping",
            ],
            namespaceKey
        );
        setMessage(() => "Loading program for saved mapping");
        const program = await loadProgram(
            engine,
            previousMappings["iw-program-mapping"].program || ""
        );
        programApi.set(program);
        stageMappingApi.set(previousMappings["iw-stage-mapping"]);
        attributeMappingApi.set(previousMappings["iw-attribute-mapping"] || {});
        ouMappingApi.set(previousMappings["iw-ou-mapping"] || {});
        programMappingApi.set(previousMappings["iw-program-mapping"] || {});
        optionMappingApi.set(previousMappings["iw-option-mapping"] || {});
        onClose();
        stepper.next();
    };

    const columns = useMemo<ColumnDef<IProgramMapping>[]>(
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
                accessorKey: "description",
                header: "Description",
            },
            {
                accessorKey: "created",
                header: "Created At",
                // cell: (info) => info.getValue<Date>().toLocaleString(),
            },
            {
                accessorKey: "lastUpdated",
                header: "Updated At",
                // cell: (info) => info.getValue<Date>().toLocaleString(),
            },
        ],
        []
    );
    return (
        <Stack flex={1}>
            {isLoading && (
                <Stack h="100%" alignItems="center" justifyContent="center">
                    <Spinner />
                </Stack>
            )}
            {isSuccess && (
                <TableDisplay<IProgramMapping>
                    columns={columns}
                    generatedData={data}
                    onRowClick={loadMapping}
                    queryKey={["step1"]}
                />
            )}

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
            {isError && <pre>{JSON.stringify(error)}</pre>}
        </Stack>
    );
};

export default Step0;
