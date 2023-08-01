import { ChangeEvent } from "react";

import {
    Pagination,
    PaginationContainer,
    PaginationNext,
    PaginationPage,
    PaginationPageGroup,
    PaginationPrevious,
    PaginationSeparator,
} from "@ajna/pagination";
import { Center, Select, Stack, Text } from "@chakra-ui/react";

export default function Paginated({
    pagesCount,
    currentPage,
    handlePageChange,
    pages,
    handlePageSizeChange,
    pageSize,
}: {
    pagesCount: number;
    currentPage: number;
    handlePageChange: (nextPage: number) => void;
    pages: number[];
    handlePageSizeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    pageSize: number;
}) {
    return (
        <Stack>
            <Pagination
                pagesCount={pagesCount}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            >
                <PaginationContainer
                    align="center"
                    justify="space-between"
                    p={4}
                    w="full"
                >
                    <PaginationPrevious
                    // _hover={{
                    //     bg: "yellow.400",
                    // }}
                    // bg="yellow.300"
                    >
                        <Text>Previous Page</Text>
                    </PaginationPrevious>
                    <PaginationPageGroup
                        isInline
                        align="center"
                        separator={
                            <PaginationSeparator
                                isDisabled
                                bg="blue.600"
                                fontSize="sm"
                                w={7}
                                jumpSize={11}
                            />
                        }
                    >
                        {pages.map((page: number) => (
                            <PaginationPage
                                w={10}
                                key={`pagination_page_${page}`}
                                page={page}
                                fontSize="sm"
                                _hover={{
                                    bg: "blue.50",
                                    color: "gray.600",
                                }}
                                _current={{
                                    bg: "blue.400",
                                    fontSize: "sm",
                                    color: "white",
                                    w: 10,
                                }}
                            />
                        ))}
                    </PaginationPageGroup>
                    <PaginationNext
                    // _hover={{
                    //     bg: "yellow.400",
                    // }}
                    // bg="yellow.300"
                    >
                        <Text>Next Page</Text>
                    </PaginationNext>
                </PaginationContainer>
            </Pagination>
            <Center w="full">
                <Select
                    ml={3}
                    onChange={handlePageSizeChange}
                    w={40}
                    value={pageSize}
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                </Select>
            </Center>
        </Stack>
    );
}
