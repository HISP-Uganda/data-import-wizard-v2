import { Box, Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { IDataSet, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect } from "react";
import { $mapping } from "../../Store";

import {
    mappingApi,
    dataSetApi,
    indicatorApi,
    programIndicatorApi,
} from "../../Events";
import { getDHIS2Resource, loadProgram, useDHIS2Metadata } from "../../Queries";
import { stepper } from "../../Store";
import Loader from "../Loader";
import Progress from "../Progress";
import { hasAttribution } from "../../utils/utils";

export default function DataSetSelect() {
    const mapping = useStore($mapping);
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
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
    ];

    const dataSetSelect = async (id?: string) => {
        if (id) {
            onOpen();
            const dataSet = await loadProgram<IDataSet>({
                resource: "dataSets",
                engine,
                id,
                fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
            });
            const attribution = hasAttribution(dataSet);
            mappingApi.update({
                attribute: "aggregate",
                value: attribution,
                path: "hasAttribution",
            });
            mappingApi.update({
                attribute: "aggregate",
                path: "dataSet",
                value: id,
            });
            dataSetApi.set(dataSet);
            onClose();
            stepper.next();
        }
    };

    const loadMetadata = async () => {
        onOpen();
        if (mapping.dataSource === "dhis2-program-indicators") {
            const data = await getDHIS2Resource<{
                programIndicators: Option[];
            }>({
                isCurrentDHIS2: mapping.isCurrentInstance,
                engine,
                resource: "programIndicators",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    paging: "false",
                },
            });
            programIndicatorApi.set(data.programIndicators);
        } else if (mapping.dataSource === "dhis2-indicators") {
            const data = await getDHIS2Resource<{ indicators: Option[] }>({
                isCurrentDHIS2: mapping.isCurrentInstance,
                engine,
                resource: "indicators",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    paging: "false",
                },
            });
            indicatorApi.set(data.indicators);
        }
        onClose();
    };

    useEffect(() => {
        loadMetadata();
        return () => {
            indicatorApi.reset();
            programIndicatorApi.reset();
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
                            rowSelection={{
                                type: "radio",
                                selectedRowKeys: mapping.aggregate?.dataSet
                                    ? [mapping.aggregate?.dataSet]
                                    : [],

                                onSelect: (record) => dataSetSelect(record.id),
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
