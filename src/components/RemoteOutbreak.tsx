import {
    Stack,
    Spinner,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import {
    IGoData,
    GODataTokenGenerationResponse,
    fetchRemote,
    IGoDataOrgUnit,
    GODataOption,
    getLowestLevelParents,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { fromPairs, isEmpty } from "lodash";
import { useState } from "react";
import {
    $programMapping,
    $token,
    tokensApi,
    currentSourceOptionsApi,
    goDataOptionsApi,
    goDataApi,
    remoteOrganisationsApi,
    programMappingApi,
} from "../pages/program/Store";
import { useRemoteGet } from "../Queries";
import { stepper } from "../Store";
import Progress from "./Progress";

export default function RemoteOutbreaks() {
    const programMapping = useStore($programMapping);
    const token = useStore($token);
    const { isOpen, onOpen, onClose } = useDisclosure();

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
        onOpen();
        if (!programMapping.isSource) {
            programMappingApi.updateMany({
                customOrgUnitColumn: true,
                orgUnitColumn: "addresses[0].locationId",
                createEnrollments: true,
                createEntities: true,
                updateEntities: true,
                incidentDateColumn: "dateOfOnset",
                enrollmentDateColumn: "dateOfOnset",
                remoteProgram: outbreak.id,
            });
        } else {
            programMappingApi.updateMany({
                remoteProgram: outbreak.id,
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
        <Stack>
            {isLoading && <Spinner />}
            {isSuccess && !isEmpty(data) && (
                <Table colorScheme="facebook">
                    <Thead>
                        <Tr>
                            <Th>Id</Th>
                            <Th>Name</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data?.map((outbreak) => (
                            <Tr
                                cursor="pointer"
                                onClick={() => onRowSelect(outbreak)}
                                key={outbreak.id}
                                bg={
                                    programMapping.remoteProgram === outbreak.id
                                        ? "gray.100"
                                        : ""
                                }
                            >
                                <Td>
                                    {outbreak.id}-{programMapping.remoteProgram}
                                </Td>
                                <Td>{outbreak.name}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
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
