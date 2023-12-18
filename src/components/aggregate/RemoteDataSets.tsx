import { useDataEngine } from "@dhis2/app-runtime";
import { IDataSet } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import {
    $aggregateMapping,
    aggregateMappingApi,
    dhis2DataSetApi,
} from "../../pages/aggregate";
import { getDHIS2SingleResource } from "../../Queries";
import { stepper } from "../../Store";
import InfiniteDHIS2Table from "../InfiniteDHIS2Table";
export default function RemoteDataSets() {
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
        aggregateMappingApi.update({
            attribute: "aggregate",
            key: "remote",
            value: data.id,
        });
        stepper.next();
    };
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
