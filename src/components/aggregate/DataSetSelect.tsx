import { Box, Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { IDataSet, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect } from "react";
import { $mapping } from "../../Store";

import { CQIDexie } from "../../db";
import {
    dataSetApi,
    indicatorApi,
    mappingApi,
    programIndicatorApi,
} from "../../Events";
import { getDHIS2Resource, loadProgram, useDHIS2Metadata } from "../../Queries";
import { stepper } from "../../Store";
import { hasAttribution } from "../../utils/utils";
import Loader from "../Loader";
import Progress from "../Progress";

export default function DataSetSelect({ db }: { db: CQIDexie }) {
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
                fields: "id,name,code,periodType,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
            });
            const attribution = hasAttribution(dataSet.categoryCombo);
            mappingApi.updateMany({
                aggregate: {
                    ...mapping.aggregate,
                    dataSet: id,
                    periodType: dataSet.periodType,
                },
                hasAttribution: attribution,
            });
            dataSetApi.set(dataSet);
            onClose();
            stepper.next();
        }
    };

    const loadMetadata = async () => {
        onOpen();
        if (mapping.dataSource === "dhis2-program-indicators") {
            db.messages.put({
                message: "Loading program indicators...",
                id: 1,
            });
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
            db.messages.put({
                message: "Loading indicators...",
                id: 1,
            });
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
        db.messages.put({
            message: "",
            id: 1,
        });
        onClose();
    };

    useEffect(() => {
        loadMetadata();
        return () => {};
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
                    {isLoading && (
                        <Progress
                            onClose={() => !isLoading}
                            db={db}
                            isOpen={isLoading}
                        />
                    )}
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
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
