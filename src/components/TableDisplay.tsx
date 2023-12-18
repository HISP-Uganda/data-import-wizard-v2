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
import { isArray, isObject } from "lodash";
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
    idField?: string | string[];
};

export default function TableDisplay<TData>({
    columns,
    generatedData,
    onRowClick,
    onCellClick,
    queryKey,
    selected,
    idField = "id",
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

    const flatData = React.useMemo(
        () => data?.pages?.flatMap((page) => page.data) ?? [],
        [data]
    );
    const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
    const totalFetched = flatData.length;
    const fetchMoreOnBottomReached = React.useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } =
                    containerRefElement;
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
        // debugTable: false,
    });

    const { rows } = table.getRowModel();

    const rowVirtualizer = useVirtual({
        parentRef: tableContainerRef,
        size: rows.length,
        overscan: 5,
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
        <Stack h="calc(100vh - 420px)">
            <Box
                overflow="auto"
                onScroll={(e) =>
                    fetchMoreOnBottomReached(e.target as HTMLDivElement)
                }
                ref={tableContainerRef}
                h="calc(100vh - 420px)"
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
                                            textTransform="none"
                                            fontSize="14px"
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
                                    key={
                                        isArray(idField)
                                            ? idField
                                                  .map((f) =>
                                                      row.getValue(String(f))
                                                  )
                                                  .join("-")
                                            : row.getValue(String(idField))
                                    }
                                    onClick={() =>
                                        onRowClick
                                            ? onRowClick(
                                                  row.getValue(
                                                      isArray(idField)
                                                          ? idField
                                                                .map((f) =>
                                                                    row.getValue(
                                                                        String(
                                                                            f
                                                                        )
                                                                    )
                                                                )
                                                                .join("-")
                                                          : row.getValue(
                                                                String(idField)
                                                            )
                                                  )
                                              )
                                            : undefined
                                    }
                                    cursor="pointer"
                                    bg={
                                        row.getValue(String(idField)) ===
                                        selected
                                            ? "gray.100"
                                            : ""
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        let value: any = cell
                                            .getContext()
                                            .getValue();
                                        if (isArray(value) || isObject(value)) {
                                            return (
                                                <Td>
                                                    <pre>
                                                        {JSON.stringify(value)}
                                                    </pre>
                                                </Td>
                                            );
                                        }
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
