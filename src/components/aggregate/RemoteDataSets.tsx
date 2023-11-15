import React from "react";
import { Spinner } from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { useStore } from "effector-react";
import { useMemo } from "react";
import { $aggregateMapping, dhis2DataSetApi } from "../../pages/aggregate";
import { getDHIS2SingleResource, useDHIS2Resources } from "../../Queries";
import TableDisplay from "../TableDisplay";
import InfiniteDHIS2Table from "../InfiniteDHIS2Table";
import { IDataSet } from "data-import-wizard-utils";
import { useDataEngine } from "@dhis2/app-runtime";
import { stepper } from "../../Store";
export default function RemoteDataSets() {
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
    const engine = useDataEngine();
    const aggregateMapping = useStore($aggregateMapping);

    const onClick = async (data: { id: string; name: string }) => {
        const dataSet = await getDHIS2SingleResource<IDataSet>({
            engine,
            isCurrentDHIS2: aggregateMapping.isCurrentInstance,
            resource: `dataSets/${data.id}`,
            params: {
                fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
            },
        });
        dhis2DataSetApi.set(dataSet);
        stepper.next();
    };
    // const { isError, isLoading, isSuccess, data, error } = useDHIS2Resources<{
    //     id: string;
    //     name: string;
    // }>({
    //     page: 1,
    //     pageSize: 20,
    //     isCurrentDHIS2: aggregateMapping.isCurrentInstance,
    //     resource: "dataSets.json",
    //     q: "",
    //     auth: aggregateMapping.authentication,
    // });

    // if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;

    // if (isLoading) return <Spinner />;

    // if (isSuccess)
    //     return (
    //         <TableDisplay<Partial<{ id: string; name: string }>>
    //             generatedData={data}
    //             columns={columns}
    //             onRowClick={(id) => {}}
    //             queryKey={["step2"]}
    //             selected={aggregateMapping.dataSet}
    //         />
    //     );
    return (
        <InfiniteDHIS2Table<{ id: string; name: string }>
            primaryKey="id"
            attributes={["id", "name"]}
            resource="dataSets.json"
            isCurrentDHIS2={aggregateMapping.isCurrentInstance}
            onClick={(d) => onClick(d)}
        />
    );
}
