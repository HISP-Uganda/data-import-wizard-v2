import { Image, Stack, useDisclosure } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-location";
import Table, { ColumnsType } from "antd/es/table";
import { generateUid, IMapping } from "data-import-wizard-utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { LocationGenerics } from "../Interfaces";
import { mappingApi } from "../Events";
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
    let { isLoading, isSuccess, isError, error, data } =
        useNamespace<IMapping>("iw-mapping");

    const [currentData, setCurrentData] = useState<
        Array<Partial<IMapping>> | undefined
    >(data);

    const afterDelete = async (id: string) => {
        setCurrentData((prev) => {
            if (prev) {
                return prev.filter(({ id: mappingId }) => mappingId !== id);
            }
            return prev;
        });
    };

    const afterClone = async (mapping: Partial<IMapping>) => {
        setCurrentData((prev) => {
            if (prev !== undefined) {
                return prev.concat(mapping);
            }
            return prev;
        });
    };

    useEffect(() => {
        setCurrentData(() => data);
        return () => {};
    }, [data?.length]);

    const columns: ColumnsType<Partial<IMapping>> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
        },
        {
            title: "Source",
            dataIndex: "source",
            key: "source",
        },
        {
            title: "Destination",
            dataIndex: "destination",
            key: "destination",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Created",
            dataIndex: "created",
            key: "created",
        },
        {
            title: "Updated",
            dataIndex: "lastUpdated",
            key: "lastUpdated",
        },
        {
            title: "Action",
            key: "action",
            render: (value, record, index) => {
                return (
                    <DropdownMenu
                        id={record.id ?? ""}
                        data={data ?? []}
                        onClose={onClose}
                        onOpen={onOpen}
                        message={message}
                        isOpen={isOpen}
                        setMessage={setMessage}
                        afterDelete={afterDelete}
                        afterClone={afterClone}
                        name={record.name ?? ""}
                    />
                );
            },
        },
    ];
    const actions = [
        {
            label: "Users",
            icon: <Image src="./group.png" alt="users" w="36px" h="36px" />,
            onClick: () => {
                actionApi.create();
                mappingApi.reset({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    type: "users",
                    id: generateUid(),
                });
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
                mappingApi.reset({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    type: "metadata",
                    id: generateUid(),
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
                mappingApi.reset({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    type: "organisation-units",
                    id: generateUid(),
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
                mappingApi.reset({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    type: "aggregate",
                    id: generateUid(),
                    headerRow: 1,
                    dataStartRow: 2,
                    chunkSize: 5000,
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
                mappingApi.reset({
                    created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    type: "individual",
                    id: generateUid(),
                });
                navigate({ to: "./individual" });
            },
        },
    ];
    if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;
    if (isLoading) return <Loader message="Loading saved mappings..." />;
    if (isSuccess) {
        return (
            <Stack h="100%" width="100%" p="10px">
                <Table
                    columns={columns}
                    dataSource={currentData}
                    rowKey="id"
                    loading={isLoading}
                />
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
