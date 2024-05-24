// import {
//     Input,
//     Stack,
//     Table,
//     Tbody,
//     Td,
//     Th,
//     Thead,
//     Tr,
// } from "@chakra-ui/react";
// import { IMapping } from "data-import-wizard-utils";
// import React, { ChangeEvent, useState } from "react";
// import { useInView } from "react-intersection-observer";
// // import { useInfiniteDHIS2Query } from "../Queries";
// import Scrollable from "./Scrollable";

// export default function InfiniteDHIS2Table<T>({
//     resource,
//     primaryKey,
//     attributes,
//     isCurrentDHIS2,
//     resourceKey,
//     onClick,
//     mapping,
// }: {
//     resource: string;
//     primaryKey: keyof T;
//     attributes: Array<keyof T>;
//     isCurrentDHIS2?: boolean;
//     resourceKey?: string;
//     onClick: (info: T) => void;
//     mapping: Partial<IMapping>;
// }) {
//     const { ref, inView } = useInView();
//     const [search, setSearch] = useState<string>("");
//     const [q, setQ] = useState<string>("");
//     const {
//         status,
//         error,
//         data,
//         fetchNextPage,
//         hasNextPage,
//         isFetchingNextPage,
//         isFetching,
//     } = useInfiniteDHIS2Query<T>({
//         search,
//         resource,
//         isCurrentDHIS2,
//         resourceKey,
//         auth: mapping.authentication,
//     });

//     React.useEffect(() => {
//         if (inView) {
//             fetchNextPage();
//         }
//     }, [inView]);
//     return (
//         <Stack>
//             <Input
//                 size="sm"
//                 value={q}
//                 onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                     setQ(e.target.value)
//                 }
//                 onKeyDown={(event) => {
//                     if (event.key === "Enter") {
//                         setSearch(q);
//                     }
//                 }}
//             />
//             {status === "loading" ? (
//                 <p>Loading...</p>
//             ) : status === "error" ? (
//                 <span>Error: {error?.message}</span>
//             ) : (
//                 <Scrollable height={"500px"}>
//                     <Table size="md">
//                         <Thead>
//                             <Tr>
//                                 <Th>Name</Th>
//                             </Tr>
//                         </Thead>
//                         <Tbody>
//                             {data?.pages.map((page) => (
//                                 <React.Fragment key={page.pager.page}>
//                                     {page.data.map((d) => (
//                                         <Tr
//                                             key={String(d[primaryKey])}
//                                             onClick={() => onClick(d)}
//                                             cursor="pointer"
//                                         >
//                                             {attributes.map((a) => (
//                                                 <Td
//                                                     key={`${d[primaryKey]}${d[a]}`}
//                                                 >
//                                                     {String(d[a])}
//                                                 </Td>
//                                             ))}
//                                         </Tr>
//                                     ))}
//                                 </React.Fragment>
//                             ))}
//                         </Tbody>
//                     </Table>
//                     <div>
//                         <button
//                             ref={ref}
//                             onClick={() => fetchNextPage()}
//                             disabled={!hasNextPage || isFetchingNextPage}
//                         >
//                             {isFetchingNextPage
//                                 ? "Loading more..."
//                                 : hasNextPage
//                                 ? "Load Newer"
//                                 : "Nothing more to load"}
//                         </button>
//                     </div>
//                     <div>
//                         {isFetching && !isFetchingNextPage
//                             ? "Background Updating..."
//                             : null}
//                     </div>
//                 </Scrollable>
//             )}
//         </Stack>
//     );
// }

export default function InfiniteDHIS2Table() {}
