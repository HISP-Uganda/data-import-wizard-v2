import { usePagination } from "@ajna/pagination";
import {
    Image,
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
import { useNavigate } from "@tanstack/react-location";
import { IMapping } from "data-import-wizard-utils";
import dayjs from "dayjs";
import { useState } from "react";
import { LocationGenerics } from "../Interfaces";
import { programMappingApi } from "../pages/program";
import { useNamespace } from "../Queries";
import { actionApi } from "../Store";
import DropdownMenu from "./DropdownMenu";
import FAB from "./FAB";
import Loader from "./Loader";
import Progress from "./Progress";

export default function Mappings() {
    const navigate = useNavigate<LocationGenerics>();
    const { onClose, onOpen, isOpen } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const { isLoading, isSuccess, isError, error, data } =
        useNamespace<IMapping>("iw-mapping");

    const outerLimit = 4;
    const innerLimit = 4;
    const {
        pages,
        pagesCount,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
    } = usePagination({
        total: data?.length || 0,
        limits: {
            outer: outerLimit,
            inner: innerLimit,
        },
        initialState: {
            pageSize: 10,
            currentPage: 1,
        },
    });

    const actions = [
        {
            label: "Users",
            icon: <Image src="./group.png" alt="users" w="36px" h="36px" />,
            onClick: () => {
                actionApi.create();
                programMappingApi.updateMany({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                });
                programMappingApi.update({ attribute: "type", value: "users" });
                navigate({ to: "./users" });
            },
        },
        {
            label: "Metadata",
            icon: (
                <Image src="./metadata.png" alt="metadata" w="36px" h="36px" />
            ),
            onClick: () => {
                actionApi.create();
                programMappingApi.updateMany({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                });
                programMappingApi.update({
                    attribute: "type",
                    value: "metadata",
                });
                navigate({ to: "./metadata" });
            },
        },
        {
            label: "Organisation Units",
            icon: (
                <Image src="./organization.png" alt="ous" w="36px" h="36px" />
            ),
            onClick: () => {
                actionApi.create();
                programMappingApi.updateMany({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                });
                programMappingApi.update({
                    attribute: "type",
                    value: "organisations",
                });
                navigate({ to: "./organisations" });
            },
        },
        {
            label: "Aggregate Data",
            icon: (
                <Image src="./numeric.png" alt="aggregate" w="36px" h="36px" />
            ),
            onClick: () => {
                actionApi.create();
                programMappingApi.updateMany({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                });
                programMappingApi.update({
                    attribute: "type",
                    value: "aggregate",
                });
                navigate({ to: "./aggregate" });
            },
        },
        {
            label: "Individual Data",
            icon: (
                <Image
                    src="./personal-data.png"
                    alt="individual"
                    w="36px"
                    h="36px"
                />
            ),
            onClick: () => {
                actionApi.create();
                programMappingApi.updateMany({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                });
                programMappingApi.update({
                    attribute: "type",
                    value: "individual",
                });
                navigate({ to: "./individual" });
            },
        },
    ];
    if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;
    if (isLoading) return <Loader message="Loading saved mappings..." />;
    if (isSuccess) {
        return (
            <Stack
                alignContent="center"
                alignItems="center"
                justifyItems="center"
                h="100%"
                width="100%"
                p="10px"
            >
                {data.length === 0 ? (
                    <Text>No Data</Text>
                ) : (
                    <Table size="sm">
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Type</Th>
                                <Th>Source</Th>
                                <Th>Destination</Th>
                                <Th>Description</Th>
                                <Th w="200px">Created</Th>
                                <Th w="200px">Updated At</Th>
                                <Th w="48px">Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {data
                                .slice(
                                    currentPage * pageSize - pageSize,
                                    pageSize * currentPage
                                )
                                .map(
                                    ({
                                        id,
                                        lastUpdated,
                                        created,
                                        name,
                                        description,
                                        source,
                                        destination,
                                        type,
                                        ...rest
                                    }) => (
                                        <Tr key={id} _hover={{ bg: "gray.50" }}>
                                            <Td>{name}</Td>
                                            <Td>{type}</Td>
                                            <Td>{source}</Td>
                                            <Td>{destination}</Td>
                                            <Td>{description}</Td>
                                            <Td>{created}</Td>
                                            <Td>{lastUpdated}</Td>
                                            <Td>
                                                <DropdownMenu
                                                    id={id}
                                                    data={data}
                                                    onClose={onClose}
                                                    onOpen={onOpen}
                                                    message={message}
                                                    isOpen={isOpen}
                                                    setMessage={setMessage}
                                                />
                                            </Td>
                                        </Tr>
                                    )
                                )}
                        </Tbody>
                    </Table>
                )}
                <FAB actions={actions} />

                <Progress
                    onClose={onClose}
                    isOpen={isOpen}
                    message={message}
                    onOpen={onOpen}
                />
            </Stack>
        );
    }
    return null;
}
