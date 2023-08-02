import {
    Stack,
    Spinner,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchRemote, IProgram } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { isEmpty } from "lodash";
import {
    $programMapping,
    dhis2ProgramApi,
    programMappingApi,
} from "../pages/program/Store";

import { useRemoteGet, makeQueryKeys } from "../Queries";
import { stepper } from "../Store";

export default function RemotePrograms() {
    const queryClient = useQueryClient();
    const programMapping = useStore($programMapping);
    const { isLoading, isError, isSuccess, error, data } = useRemoteGet<
        {
            programs: Array<Partial<IProgram>>;
        },
        {}
    >({
        authentication: {
            ...programMapping.authentication,
            params: {
                "1": { value: "id,name", param: "fields" },
                "2": { value: "false", param: "paging" },
            },
        },
    });
    const onRowSelect = async (program: string) => {
        programMappingApi.update({
            attribute: "remoteProgram",
            value: program,
        });
        const queryParams = {
            "1": {
                value: "organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,name,code,programStageDataElements[id,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,valueType,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
                param: "fields",
            },
        };
        const { keys } = makeQueryKeys(queryParams);
        const data = await queryClient.fetchQuery<
            Partial<IProgram> | undefined,
            Error
        >({
            queryKey: ["remote", program, keys],
            queryFn: async () => {
                return fetchRemote<Partial<IProgram>>(
                    {
                        ...programMapping.authentication,
                        params: queryParams,
                    },
                    `api/programs/${program}.json`
                );
            },
        });
        if (data) {
            dhis2ProgramApi.set(data);
        }
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
                        {data.programs.map(({ id, name }: any) => (
                            <Tr
                                cursor="pointer"
                                onClick={() => onRowSelect(id)}
                                key={id}
                                bg={
                                    id === programMapping.program
                                        ? "gray.100"
                                        : ""
                                }
                            >
                                <Td>{id}</Td>
                                <Td>{name}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
            {isError && <pre>{JSON.stringify(error, null, 2)}</pre>}
        </Stack>
    );
}
