import {
    Box,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Stack,
    Spacer,
} from "@chakra-ui/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { useVirtual } from "react-virtual";
import { fetchData, Response } from "./makeData";

const fetchSize = 5;

type TableProps<TData> = {
    columns: ColumnDef<TData>[];
    generatedData: TData[];
    queryKey: any[];
    onRowClick?: (id: string) => void;
    onCellClick?: (id: string) => void;
    selected?: string;
};

export default function TableDisplay<TData>({
    columns,
    generatedData,
    onRowClick,
    onCellClick,
    queryKey,
    selected,
}: TableProps<TData>) {
    const tableContainerRef = React.useRef<HTMLDivElement>(null);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    //react-query has an useInfiniteQuery hook just for this situation!
    const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery<
        Response<TData>
    >(
        [...queryKey, sorting], //adding sorting state as key causes table to reset and fetch from new beginning upon sort
        async ({ pageParam = 0 }) => {
            const start = pageParam * fetchSize;
            const fetchedData = fetchData<TData>(
                generatedData,
                start,
                fetchSize,
                sorting
            ); //pretend api call
            return fetchedData;
        },
        {
            getNextPageParam: (_lastGroup, groups) => groups.length,
            keepPreviousData: true,
            refetchOnWindowFocus: false,
        }
    );

    //we must flatten the array of arrays from the useInfiniteQuery hook
    const flatData = React.useMemo(
        () => data?.pages?.flatMap((page) => page.data) ?? [],
        [data]
    );
    const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
    const totalFetched = flatData.length;

    //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
    const fetchMoreOnBottomReached = React.useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } =
                    containerRefElement;
                //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
                if (
                    scrollHeight - scrollTop - clientHeight < 300 &&
                    !isFetching &&
                    totalFetched < totalDBRowCount
                ) {
                    fetchNextPage();
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
    );

    //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
    React.useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current);
    }, [fetchMoreOnBottomReached]);

    const table = useReactTable({
        data: flatData,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
    });

    const { rows } = table.getRowModel();

    //Virtualizing is optional, but might be necessary if we are going to potentially have hundreds or thousands of rows
    const rowVirtualizer = useVirtual({
        parentRef: tableContainerRef,
        size: rows.length,
        overscan: 10,
    });
    const { virtualItems: virtualRows, totalSize } = rowVirtualizer;
    const paddingTop =
        virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
    const paddingBottom =
        virtualRows.length > 0
            ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
            : 0;

    if (isLoading) {
        return <>Loading...</>;
    }
    return (
        <Stack h="calc(100vh - 322px)">
            <Box
                overflow="auto"
                onScroll={(e) =>
                    fetchMoreOnBottomReached(e.target as HTMLDivElement)
                }
                ref={tableContainerRef}
                h="calc(100vh - 372px)"
            >
                <Table>
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr
                                key={headerGroup.id}
                                top={0}
                                position="sticky"
                                bg="white"
                            >
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <Th
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            style={{ width: header.getSize() }}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    {...{
                                                        className:
                                                            header.column.getCanSort()
                                                                ? "cursor-pointer select-none"
                                                                : "",
                                                        onClick:
                                                            header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext()
                                                    )}
                                                    {{
                                                        asc: "🔼",
                                                        desc: "🔽",
                                                    }[
                                                        header.column.getIsSorted() as string
                                                    ] ?? null}
                                                </div>
                                            )}
                                        </Th>
                                    );
                                })}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody>
                        {paddingTop > 0 && (
                            <Tr>
                                <Td style={{ height: `${paddingTop}px` }} />
                            </Tr>
                        )}
                        {virtualRows.map((virtualRow) => {
                            const row = rows[virtualRow.index] as Row<TData>;
                            return (
                                <Tr
                                    key={row.id}
                                    onClick={() =>
                                        onRowClick
                                            ? onRowClick(row.getValue("id"))
                                            : undefined
                                    }
                                    cursor="pointer"
                                    bg={
                                        row.getValue("id") === selected
                                            ? "gray.100"
                                            : ""
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Td
                                                key={cell.id}
                                                onClick={() =>
                                                    onCellClick
                                                        ? onCellClick(cell.id)
                                                        : undefined
                                                }
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </Td>
                                        );
                                    })}
                                </Tr>
                            );
                        })}
                        {paddingBottom > 0 && (
                            <Tr>
                                <Td style={{ height: `${paddingBottom}px` }} />
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>
            <Spacer />
            <div>
                Fetched {flatData.length} of {totalDBRowCount} Rows.
            </div>
        </Stack>
    );
}
