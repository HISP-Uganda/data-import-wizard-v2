import { Box, Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { IDataSet, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect } from "react";
import {
    $aggregateMapping,
    aggregateMappingApi,
    dataSetApi,
    indicatorApi,
    programIndicatorApi,
} from "../../pages/aggregate";
import { getDHIS2Resource, loadProgram, useDHIS2Metadata } from "../../Queries";
import { stepper } from "../../Store";
import Loader from "../Loader";
import Progress from "../Progress";

export default function DataSetSelect() {
    const aggregateMapping = useStore($aggregateMapping);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const engine = useDataEngine();
    const { isLoading, isError, isSuccess, error, data } = useDHIS2Metadata<{
        id: string;
        name: string;
    }>("dataSets", 1, 100, "id,name");

    const columns: ColumnsType<
        Partial<{
            id: string;
            name: string;
        }>
    > = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
    ];

    // const columns = useMemo<ColumnDef<Partial<{ id: string; name: string }>>[]>(
    //     () => [
    //         {
    //             accessorKey: "id",
    //             header: "ID",
    //             size: 20,
    //         },
    //         {
    //             accessorKey: "name",
    //             header: "Name",
    //             size: 20,
    //         },
    //     ],
    //     []
    // );

    const dataSetSelect = async (id?: string) => {
        if (id) {
            onOpen();
            const dataSet = await loadProgram<IDataSet>({
                resource: "dataSets",
                engine,
                id,
                fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
            });
            dataSetApi.set(dataSet);
            aggregateMappingApi.update({
                attribute: "aggregate",
                key: "dataSet",
                value: id,
            });
            onClose();
            stepper.next();
        }
    };

    const loadMetadata = async () => {
        onOpen();
        if (aggregateMapping.dataSource === "dhis2-program-indicators") {
            const data = await getDHIS2Resource<Option>({
                isCurrentDHIS2: aggregateMapping.isCurrentInstance,
                engine,
                resource: "programIndicators",
                resourceKey: "programIndicators",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    paging: "false",
                },
            });
            programIndicatorApi.set(data);
        }
        if (aggregateMapping.dataSource === "dhis2-indicators") {
            const data = await getDHIS2Resource<Option>({
                isCurrentDHIS2: aggregateMapping.isCurrentInstance,
                engine,
                resource: "indicators",
                resourceKey: "indicators",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    paging: "false",
                },
            });
            indicatorApi.set(data);
        }
        onClose();
    };

    useEffect(() => {
        loadMetadata();
        return () => {
            // indicatorApi.reset();
            // programIndicatorApi.reset();
        };
    }, []);

    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    position="relative"
                    overflow="auto"
                    whiteSpace="nowrap"
                    h="calc(100vh - 350px)"
                >
                    {isLoading && <Loader />}
                    {isSuccess && (
                        <Table
                            columns={columns}
                            dataSource={data.data}
                            rowKey="id"
                            onRow={(record) => {
                                return {
                                    onClick: () => {
                                        dataSetSelect(record.id);
                                    },
                                };
                            }}
                        />
                    )}
                    {isError && JSON.stringify(error)}
                </Box>
            </Box>

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Loading Selected DataSet"
                onOpen={onOpen}
            />
        </Stack>
    );
}
