import { Stack, Text, useDisclosure } from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import {
    fetchGoDataHierarchy,
    fetchRemote,
    GODataOption,
    GODataTokenGenerationResponse,
    IGoData,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { fromPairs, isEmpty } from "lodash";
import { useEffect } from "react";
import { CQIDexie } from "../db";
import {
    currentSourceOptionsApi,
    goDataApi,
    goDataOptionsApi,
    mappingApi,
    remoteOrganisationsApi,
    tokensApi,
} from "../Events";
import { useRemoteGet } from "../Queries";
import { $mapping, $token, hasErrorApi, stepper } from "../Store";
import Loader from "./Loader";
import Progress from "./Progress";

export default function RemoteOutbreaks({ db }: { db: CQIDexie }) {
    const programMapping = useStore($mapping);
    const token = useStore($token);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const columns: ColumnsType<IGoData> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
    ];

    const { isLoading, isError, isSuccess, error, data } = useRemoteGet<
        IGoData[],
        GODataTokenGenerationResponse
    >({
        authentication: programMapping.authentication,
        getToken: true,
        tokenField: "id",
        addTokenTo: "params",
        tokenName: "access_token",
        tokenGenerationURL: "api/users/login",
        tokenGenerationPasswordField: "password",
        tokenGenerationUsernameField: "email",
        url: "api/outbreaks",
    });

    useEffect(() => {
        if (isError) {
            hasErrorApi.set(true);
        }
        return () => {
            hasErrorApi.set(false);
        };
    }, [isError]);

    const onRowSelect = async (outbreak: IGoData) => {
        const other = programMapping.isSource
            ? { destination: outbreak.name }
            : { source: outbreak.name };
        onOpen();
        mappingApi.updateMany({
            program: {
                ...programMapping.program,
                remoteProgram: outbreak.id,
                ...other,
            },
        });
        await db.messages.put({
            message: "Loading Go.Data Hierarchy...",
            id: 1,
        });
        const hierarchy = await fetchGoDataHierarchy(
            {
                ...programMapping.authentication,
                params: new Map([
                    [
                        "auth",
                        {
                            param: "access_token",
                            value: token,
                        },
                    ],
                ]),
            },
            outbreak.locationIds,
        );
        await db.messages.put({
            message: "Loading Go.Data Reference Data...",
            id: 1,
        });
        const goDataOptions = await fetchRemote<GODataOption[]>(
            {
                ...programMapping.authentication,
                params: new Map([
                    [
                        "auth",
                        {
                            param: "access_token",
                            value: token,
                        },
                    ],
                ]),
            },
            "api/reference-data",
        );
        await db.messages.put({
            message: "Loading Go.Data Language Tokens...",
            id: 1,
        });
        const tokens = await fetchRemote<{
            languageId: string;
            lastUpdateDate: string;
            tokens: Array<{ token: string; translation: string }>;
        }>(
            {
                ...programMapping.authentication,
                params: new Map([
                    [
                        "auth",
                        {
                            param: "access_token",
                            value: token,
                        },
                    ],
                ]),
            },
            "api/languages/english_us/language-tokens",
        );

        const allTokens = fromPairs(
            tokens.tokens.map(({ token, translation }) => [token, translation]),
        );

        tokensApi.set(new Map(Object.entries(allTokens)));
        goDataOptionsApi.set(
            goDataOptions.filter(({ deleted }) => deleted === false),
        );
        if (!programMapping.isSource) {
            currentSourceOptionsApi.set(
                goDataOptions.map(({ id }) => {
                    return { label: allTokens[id] || id, value: id };
                }),
            );
        }
        goDataApi.set(outbreak);
        remoteOrganisationsApi.set(
            hierarchy.flat().map(({ id, name, parentInfo }) => ({
                id,
                name: `${[...parentInfo.map(({ name }) => name), name].join(
                    "/",
                )}`,
            })),
        );
        onClose();
        stepper.next();
    };
    return (
        <Stack w="100%" h="100%">
            {isLoading && <Loader message="Loading outbreaks..." />}
            {isSuccess && !isEmpty(data) && (
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    rowSelection={{
                        type: "radio",
                        selectedRowKeys: programMapping.program?.remoteProgram
                            ? [programMapping.program?.remoteProgram]
                            : [],
                        onSelect: (outbreak) => onRowSelect(outbreak),
                    }}
                />
            )}
            {isError && (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    w="100%"
                    h="100%"
                >
                    <Text fontSize="3xl">Go.Data Error</Text>
                    <Text color="red.500" fontSize="2xl">
                        {error.message}
                    </Text>
                </Stack>
            )}
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
