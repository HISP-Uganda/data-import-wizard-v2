import {
    Spinner,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useDataEngine } from "@dhis2/app-runtime";
import { setNext } from "../../Events";
import { setProgram, updateMapping } from "../../pages/program/Events";
import { IProgram } from "../../pages/program/Interfaces";
import { usePrograms } from "../../Queries";

function TableDisplay({ data }: { data: Partial<IProgram>[] }) {
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
        updateMapping({ attribute: "program", value: id });
        const query = {
            data: {
                resource: `programs/${id}.json`,
                params: {
                    fields: "organisationUnits[id,code,name],programStages[id,name,code,programStageDataElements[id,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,valueType,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
                },
            },
        };

        const { data }: any = await engine.query(query);
        setProgram(data);
        setNext();
    };
    return (
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
    );
}
const Step1 = () => {
    const { isLoading, isError, isSuccess, error, data } = usePrograms(1, 100);
    return (
        <Stack>
            {isLoading && <Spinner />}
            {isSuccess && <TableDisplay data={data.programs} />}
            {isError && JSON.stringify(error)}
        </Stack>
    );
};

export default Step1;
