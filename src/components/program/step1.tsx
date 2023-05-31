import {
    Box,
    Spinner,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { IProgram } from "data-import-wizard-utils";
import {
    $programMapping,
    programApi,
    programMappingApi,
} from "../../pages/program/Store";
import { loadProgram, usePrograms } from "../../Queries";
import { stepper } from "../../Store";
import Progress from "../Progress";

function TableDisplay({ data }: { data: Partial<IProgram>[] }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($programMapping);
    const engine = useDataEngine();
    const columnHelper = createColumnHelper<Partial<IProgram>>();
    const columns = [
        columnHelper.accessor("id", {
            id: "id",
            cell: (info) => <Text>{info.getValue()}</Text>,
        }),
        columnHelper.accessor("name", {
            id: "name",
            cell: (info) => <Text>{info.getValue()}</Text>,
        }),
        columnHelper.accessor("programType", {
            id: "programType",
            cell: (info) => <Text>{info.getValue()}</Text>,
        }),
    ];
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });
    const onProgramSelect = async (id: string) => {
        onOpen();
        const data = await loadProgram(engine, id);
        programMappingApi.update({ attribute: "program", value: id });
        programMappingApi.update({
            attribute: "trackedEntityType",
            value: getOr("", "trackedEntityType.id", data),
        });
        programApi.set(data);
        onClose();
        stepper.next();
    };
    return (
        <Stack>
            <Table>
                <Thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map((row) => (
                        <Tr
                            key={row.id}
                            cursor="pointer"
                            onClick={() => onProgramSelect(row.getValue("id"))}
                            bg={
                                row.getValue("id") === programMapping.program
                                    ? "yellow"
                                    : ""
                            }
                        >
                            {row.getVisibleCells().map((cell) => (
                                <Td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Loading Selected Program"
                onOpen={onOpen}
            />
        </Stack>
    );
}
const Step1 = () => {
    const { isLoading, isError, isSuccess, error, data } = usePrograms(1, 100);
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
                    {isSuccess && <TableDisplay data={data.programs} />}
                    {isError && JSON.stringify(error)}
                </Box>
            </Box>
        </Stack>
    );
};

export default Step1;
