import { Box, Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { IProgram } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import {
    $programMapping,
    programApi,
    programMappingApi,
} from "../../pages/program";
import { loadProgram, usePrograms } from "../../Queries";
import { stepper } from "../../Store";
import Loader from "../Loader";
import Progress from "../Progress";

const ProgramSelect = () => {
    const { isLoading, isError, isSuccess, error, data } = usePrograms(1, 100);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const engine = useDataEngine();
    const programMapping = useStore($programMapping);

    const columns: ColumnsType<Partial<IProgram>> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Program Type",
            dataIndex: "programType",
            key: "programType",
        },
    ];

    const onProgramSelect = async (id?: string) => {
        if (id) {
            onOpen();
            let data = await loadProgram<IProgram>({
                engine,
                id,
                fields: "id,name,trackedEntityType,programType,organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,repeatable,name,code,programStageDataElements[id,compulsory,name,dataElement[id,name,code,optionSetValue,optionSet[id,name,options[id,name,code]]]]],programTrackedEntityAttributes[id,mandatory,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
                resource: "programs",
            });
            const other = programMapping.isSource
                ? { source: data.name }
                : { destination: data.name };
            programMappingApi.update({
                attribute: "program",
                value: {
                    ...programMapping.program,
                    trackedEntityType: getOr("", "trackedEntityType.id", data),
                    program: id,
                    programType: getOr("", "programType", data),
                    ...other,
                },
            });
            programApi.set(data);
            onClose();
            stepper.next();
        }
    };
    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    overflow="auto"
                    whiteSpace="nowrap"
                    h="calc(100vh - 350px)"
                >
                    {isLoading && (
                        <Loader message="Loading DHIS2 programs..." />
                    )}
                    {isSuccess && (
                        <Table
                            columns={columns}
                            dataSource={data.programs}
                            rowKey="id"
                            rowSelection={{
                                type: "radio",
                                selectedRowKeys: programMapping.program?.program
                                    ? [programMapping.program?.program]
                                    : [],

                                onSelect: (record) =>
                                    onProgramSelect(record.id),
                            }}
                        />
                    )}
                    {isError && JSON.stringify(error)}
                </Box>
            </Box>

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Loading Selected Program"
                onOpen={onOpen}
            />
        </Stack>
    );
};

export default ProgramSelect;
