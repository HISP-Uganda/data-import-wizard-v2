import { Stack, useDisclosure, Text } from "@chakra-ui/react";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import {
    fetchGoDataHierarchy,
    fetchRemote,
    getLowestLevelParents,
    GODataOption,
    GODataTokenGenerationResponse,
    IGoData,
    IGoDataOrgUnit,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { fromPairs, isEmpty } from "lodash";
import {
    $programMapping,
    $token,
    currentSourceOptionsApi,
    goDataApi,
    goDataOptionsApi,
    programMappingApi,
    remoteOrganisationsApi,
    tokensApi,
} from "../pages/program";
import { useRemoteGet } from "../Queries";
import { stepper, $hasError, hasErrorApi } from "../Store";
import Loader from "./Loader";
import Progress from "./Progress";
import { useEffect } from "react";

export default function RemoteOutbreaks() {
    const programMapping = useStore($programMapping);
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
        if (!programMapping.isSource) {
            programMappingApi.updateMany({
                orgUnitColumn: "addresses[0].locationId",
                customOrgUnitColumn: true,
                program: {
                    ...programMapping.program,
                    createEnrollments: true,
                    createEntities: true,
                    updateEntities: true,
                    incidentDateColumn: "dateOfOnset",
                    enrollmentDateColumn: "dateOfOnset",
                    remoteProgram: outbreak.id,
                },
            });
        } else {
            programMappingApi.updateMany({
                program: {
                    ...programMapping.program,
                    remoteProgram: outbreak.id,
                    ...other,
                },
            });
        }

        const hierarchy = await fetchGoDataHierarchy(
            {
                ...programMapping.authentication,
                params: { auth: { param: "access_token", value: token } },
            },
            outbreak.locationIds
        );
        const goDataOptions = await fetchRemote<GODataOption[]>(
            {
                ...programMapping.authentication,
                params: { auth: { param: "access_token", value: token } },
            },
            "api/reference-data"
        );
        const tokens = await fetchRemote<{
            languageId: string;
            lastUpdateDate: string;
            tokens: Array<{ token: string; translation: string }>;
        }>(
            {
                ...programMapping.authentication,
                params: { auth: { param: "access_token", value: token } },
            },
            "api/languages/english_us/language-tokens"
        );

        const allTokens = fromPairs(
            tokens.tokens.map(({ token, translation }) => [token, translation])
        );

        tokensApi.set(allTokens);
        goDataOptionsApi.set(
            goDataOptions.filter(({ deleted }) => deleted === false)
        );
        if (!programMapping.isSource) {
            currentSourceOptionsApi.set(
                goDataOptions.map(({ id }) => {
                    return { label: allTokens[id] || id, value: id };
                })
            );
        }
        goDataApi.set(outbreak);
        remoteOrganisationsApi.set(
            hierarchy.flat().map(({ id, name, parentInfo }) => ({
                id,
                name: `${[...parentInfo.map(({ name }) => name), name].join(
                    "/"
                )}`,
            }))
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

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Loading selected outbreak"
                onOpen={onOpen}
            />
        </Stack>
    );
}
