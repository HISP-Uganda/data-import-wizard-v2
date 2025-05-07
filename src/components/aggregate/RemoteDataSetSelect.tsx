import { Box, Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import Table, { ColumnsType } from "antd/es/table";
import { IDataSet } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { $mapping } from "../../Store";
import { dhis2DataSetApi, mappingApi } from "../../Events";
import { getDHIS2Resource, useDHIS2Resource } from "../../Queries";
import { stepper } from "../../Store";
import Loader from "../Loader";
import Progress from "../Progress";
import { CQIDexie } from "../../db";
export default function RemoteDataSetSelect({ db }: { db: CQIDexie }) {
    const engine = useDataEngine();
    const mapping = useStore($mapping);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const columns: ColumnsType<IDataSet> = [
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
    const onClick = async (data: { id: string; name: string }) => {
        onOpen();
        const dataSet = await getDHIS2Resource<IDataSet>({
            engine,
            isCurrentDHIS2: mapping.isCurrentInstance,
            resource: `dataSets/${data.id}`,
            params: {
                fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
            },
            auth: mapping.authentication,
        });
        dhis2DataSetApi.set(dataSet);
        mappingApi.updateMany({
            aggregate: { ...mapping.aggregate, remote: data.id },
        });
        onClose();
        stepper.next();
    };

    const { isError, isLoading, isSuccess, data, error } = useDHIS2Resource<{
        dataSets: IDataSet[];
    }>({
        pageSize: 100,
        page: 1,
        resource: "dataSets.json",
        isCurrentDHIS2: mapping.isCurrentInstance,
        auth: mapping.authentication,
        q: "",
        fields: "id,name,code",
    });
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
                            dataSource={data.dataSets}
                            rowKey="id"
                            rowSelection={{
                                type: "radio",
                                selectedRowKeys: mapping.aggregate?.remote
                                    ? [mapping.aggregate?.remote]
                                    : [],

                                onSelect: (record) => onClick(record),
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
