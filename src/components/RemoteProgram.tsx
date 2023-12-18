import { useDataEngine } from "@dhis2/app-runtime";
import { IProgram } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import {
    $programMapping,
    dhis2ProgramApi,
    programMappingApi,
} from "../pages/program";

import { getDHIS2SingleResource, useDHIS2Resources } from "../Queries";
import { stepper } from "../Store";
import InfiniteDHIS2Table from "./InfiniteDHIS2Table";

export default function RemotePrograms() {
    const engine = useDataEngine();
    const programMapping = useStore($programMapping);
    const onRowSelect = async ({ id }: { id: string; name: string }) => {
        const program = await getDHIS2SingleResource<IProgram>({
            engine,
            isCurrentDHIS2: programMapping.isCurrentInstance,
            resource: `programs/${id}`,
            params: {
                fields: "organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,name,code,programStageDataElements[id,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,valueType,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
            },
        });
        programMappingApi.update({
            attribute: "program",
            value: { ...programMapping.program, remoteProgram: id },
        });

        dhis2ProgramApi.set(program);
        stepper.next();
    };
    return (
        <InfiniteDHIS2Table<{ id: string; name: string }>
            primaryKey="id"
            attributes={["id", "name"]}
            resource="programs.json"
            isCurrentDHIS2={programMapping.isCurrentInstance}
            onClick={(d) => onRowSelect(d)}
        />
    );
}
