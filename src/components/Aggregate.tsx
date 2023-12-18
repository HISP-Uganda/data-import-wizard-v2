import { Stack, useToast } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Option, Step } from "data-import-wizard-utils";
import dayjs from "dayjs";
import { useStore } from "effector-react";
import {
    $aggMetadata,
    $aggregateMapping,
    $dataSet,
    $dhis2DataSet,
    $disabled,
    $name,
    $names,
    $otherName,
    aggregateMappingApi,
} from "../pages/aggregate";
import {
    $attributeMapping,
    $data,
    $organisationUnitMapping,
} from "../pages/program";
import { $action, $steps, actionApi, stepper } from "../Store";
import Attribution from "./aggregate/Attribution";
import Configuration from "./aggregate/Configuration";
import DataMapping from "./aggregate/DataMapping";
import DataSetSelect from "./aggregate/DataSetSelect";
import DHIS2Options from "./aggregate/DHIS2Options";
import ImportSummary from "./aggregate/ImportSummary";
import Pivot from "./aggregate/Pivot";
import Preview from "./aggregate/Preview";
import RemoteDataSets from "./aggregate/RemoteDataSets";
import MappingDetails from "./MappingDetails";
import OrganisationUnitMapping from "./OrganisationUnitMapping";
import StepperButtons from "./StepperButtons";
import StepsDisplay from "./StepsDisplay";
const importTypes: Option[] = [
    { value: "api", label: "api" },
    { value: "json", label: "json" },
    { value: "csv-line-list", label: "csv-line-list" },
    { value: "xlsx-line-list", label: "xlsx-line-list" },
    { value: "xlsx-tabular-data", label: "xlsx-tabular-data" },
    { value: "xlsx-form", label: "xlsx-form" },
    { value: "dhis2-data-set", label: "dhis2-data-set" },
    { value: "dhis2-indicators", label: "dhis2-indicators" },
    { value: "dhis2-program-indicators", label: "dhis2-program-indicators" },
    {
        value: "manual-dhis2-program-indicators",
        label: "manual-dhis2-program-indicators",
    },
];

const Aggregate = () => {
    const activeStep = useStore($steps);
    const aggregateMapping = useStore($aggregateMapping);
    const disabled = useStore($disabled);
    const name = useStore($name);
    const action = useStore($action);
    const otherName = useStore($otherName);
    const toast = useToast();
    const names = useStore($names);
    const engine = useDataEngine();
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const { destinationOrgUnits, sourceOrgUnits } = useStore($aggMetadata);
    const steps: Step[] = [
        {
            label: "Mapping Details",
            content: (
                <MappingDetails
                    mapping={aggregateMapping}
                    updater={aggregateMappingApi.update}
                    importTypes={importTypes}
                />
            ),
            nextLabel: "Next Step",
            id: 2,
        },
        {
            label: `${name} Data Set`,
            content: <DataSetSelect />,
            nextLabel: "Next Step",
            id: 3,
        },
        {
            label: `${otherName} Data Set`,
            content: <RemoteDataSets />,
            nextLabel: "Next Step",
            id: 4,
        },
        {
            label: "Configuration",
            content: <Configuration />,
            nextLabel: "Next Step",
            id: 5,
        },
        {
            label: "Pivot",
            content: <Pivot />,
            nextLabel: "Next Step",
            id: 12,
        },
        {
            label: "Organisation Mapping",
            content: (
                <OrganisationUnitMapping
                    mapping={aggregateMapping}
                    sourceOrgUnits={sourceOrgUnits}
                    destinationOrgUnits={destinationOrgUnits}
                    update={aggregateMappingApi.update}
                />
            ),
            nextLabel: "Next Step",
            id: 6,
        },
        {
            label: "Category Option Combo Mapping",
            content: <Attribution />,
            nextLabel: "Next Step",
            id: 11,
        },
        {
            label: "Data Mapping",
            content: <DataMapping />,
            nextLabel: "Next Step",
            id: 7,
        },
        {
            label: "Options",
            content: <DHIS2Options />,
            nextLabel: "Next Step",
            id: 8,
        },
        {
            label: "Preview",
            content: <Preview />,
            nextLabel: "Import",
            id: 9,
        },
        {
            label: "Import Summary",
            content: <ImportSummary />,
            nextLabel: "Next Step",
            id: 10,
        },
    ];

    const activeSteps = () => {
        return steps.filter(({ id }) => {
            const notPrefetch = aggregateMapping.prefetch ? [] : [9];
            const prefetch = aggregateMapping.prefetch ? [9] : [];
            if (aggregateMapping.dataSource === "api") {
                return [1, 2, 3, ...prefetch].indexOf(id) !== -1;
            }

            if (aggregateMapping.dataSource === "dhis2-data-set") {
                return [5, 12, ...notPrefetch].indexOf(id) === -1;
            }
            if (aggregateMapping.dataSource === "dhis2-indicators") {
                return [4, 11, 12, ...notPrefetch].indexOf(id) === -1;
            }
            if (aggregateMapping.dataSource === "dhis2-program-indicators") {
                return [4, 11, 12, ...notPrefetch].indexOf(id) === -1;
            }
            if (
                aggregateMapping.dataSource &&
                ["csv-line-list", "xlsx-line-list"].indexOf(
                    aggregateMapping.dataSource
                ) !== -1
            ) {
                return [4, 8, 7, 12].indexOf(id) === -1;
            }
            if (
                aggregateMapping.dataSource ===
                "manual-dhis2-program-indicators"
            ) {
                return [3, 4, 11, 6, 9].indexOf(id) === -1;
            }
            return [4, 8, 12].indexOf(id) === -1;
        });
    };

    const onNext = () => {
        if (activeStep === activeSteps().length - 1) {
            stepper.reset();
        } else {
            stepper.next();
        }
    };

    const onSave = async () => {
        const type = action === "creating" ? "create" : "update";
        const mutation: any = {
            type,
            resource: `dataStore/iw-mapping/${aggregateMapping.id}`,
            data: {
                ...aggregateMapping,
                lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                ...names,
                type: "aggregate",
            },
        };
        const mutation2: any = {
            type,
            resource: `dataStore/iw-ou-mapping/${aggregateMapping.id}`,
            data: organisationUnitMapping,
        };
        const mutation3: any = {
            type,
            resource: `dataStore/iw-attribute-mapping/${aggregateMapping.id}`,
            data: attributeMapping,
        };

        const data = await Promise.all([
            engine.mutate(mutation),
            engine.mutate(mutation2),
            engine.mutate(mutation3),
        ]);

        actionApi.edit();
        toast({
            title: "Mapping saved",
            description: "Mapping has been successfully saved",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
        return data;
    };
    const onFinish = () => {
        aggregateMappingApi.reset();
        $attributeMapping.reset();
        $organisationUnitMapping.reset();
        $data.reset();
        $dataSet.reset();
        $dhis2DataSet.reset();
    };

    return (
        <Stack p="20px" spacing="30px" flex={1}>
            <StepsDisplay
                activeStep={activeStep}
                activeSteps={activeSteps}
                disabled={disabled}
            />
            <StepperButtons
                disabled={disabled}
                steps={activeSteps()}
                onNext={onNext}
                onSave={onSave}
                onFinish={onFinish}
            />
        </Stack>
    );
};

export default Aggregate;
