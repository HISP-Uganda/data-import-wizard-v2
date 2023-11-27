import { Stack, useDisclosure } from "@chakra-ui/react";
import { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import {
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
import { stepper } from "../Store";
import Loader from "./Loader";
import Progress from "./Progress";

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
        const organisations = await fetchRemote<IGoDataOrgUnit[]>(
            {
                ...programMapping.authentication,
                params: { auth: { param: "access_token", value: token } },
            },
            "api/locations"
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
        if (!programMapping.isSource) {
            const goDataOptions = await fetchRemote<GODataOption[]>(
                {
                    ...programMapping.authentication,
                    params: { auth: { param: "access_token", value: token } },
                },
                "api/reference-data"
            );
            currentSourceOptionsApi.set(
                goDataOptions.map(({ id }) => {
                    return { label: allTokens[id] || id, value: id };
                })
            );
            goDataOptionsApi.set(goDataOptions);
        }
        goDataApi.set(outbreak);
        if (organisations) {
            remoteOrganisationsApi.set(getLowestLevelParents(organisations));
        }
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
                    pagination={{ pageSize: 25 }}
                    rowSelection={{
                        type: "radio",
                        selectedRowKeys: programMapping.program?.remoteProgram
                            ? [programMapping.program?.remoteProgram]
                            : [],
                        onSelect: (outbreak) => onRowSelect(outbreak),
                    }}
                />
            )}
            {isError && <pre>{JSON.stringify(error, null, 2)}</pre>}

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Loading selected outbreak"
                onOpen={onOpen}
            />
        </Stack>
    );
}
