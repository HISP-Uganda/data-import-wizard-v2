import { Stack, Text, useToast } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Option, Step } from "data-import-wizard-utils";
import dayjs from "dayjs";
import { useStore } from "effector-react";
import {
    $attributeMapping,
    $attributionMapping,
    $data,
    $dataSet,
    $dhis2DataSet,
    $disabled,
    $mapping,
    $name,
    $names,
    $organisationUnitMapping,
    $otherName,
} from "../Store";

import { useEffect } from "react";
import { mappingApi } from "../Events";
import { $action, $steps, actionApi, stepper } from "../Store";
import Attribution from "./aggregate/Attribution";
import Configuration from "./aggregate/Configuration";
import DataMapping from "./aggregate/DataMapping";
import DataSetSelect from "./aggregate/DataSetSelect";
import ImportSummary from "./aggregate/AggImportSummary";
import Pivot from "./aggregate/Pivot";
import RemoteDataSetSelect from "./aggregate/RemoteDataSetSelect";
import DataPreview from "./DataPreview";
import MappingDetails from "./MappingDetails";
import MappingOptions from "./MappingOptions";
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
    const mapping = useStore($mapping);
    const disabled = useStore($disabled);
    const name = useStore($name);
    const action = useStore($action);
    const otherName = useStore($otherName);
    const toast = useToast();
    const names = useStore($names);
    const engine = useDataEngine();
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const attributionMapping = useStore($attributionMapping);
    const steps: Step[] = [
        {
            label: "Mapping Details",
            content: <MappingDetails importTypes={importTypes} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 2,
        },
        {
            label: `${name} Data Set`,
            content: <DataSetSelect />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 3,
        },
        {
            label: `${otherName} Data Set`,
            content: <RemoteDataSetSelect />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 4,
        },
        {
            label: "Configuration",
            content: <Configuration />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 5,
        },
        {
            label: "Pivot",
            content: <Pivot />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 12,
        },
        {
            label: "Organisation Mapping",
            content: <OrganisationUnitMapping />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 6,
        },
        {
            label: "Attribution Mapping",
            content: <Attribution />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 11,
        },
        {
            label: "Data Mapping",
            content: <DataMapping />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 7,
        },
        {
            label: "Options",
            content: <MappingOptions />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 8,
        },
        {
            label: "Preview",
            content: <DataPreview />,
            lastLabel: "",
            nextLabel: "Import",
            id: 9,
        },
        {
            label: "Import Summary",
            content: <ImportSummary />,
            lastLabel: "Finish",
            nextLabel: "Next Step",
            id: 10,
        },
    ];

    const activeSteps = () => {
        return steps.filter(({ id }) => {
            const notPrefetch = mapping.prefetch ? [] : [9];
            const prefetch = mapping.prefetch ? [9] : [];
            const hasAttribution = mapping.aggregate?.hasAttribution
                ? [11]
                : [];
            const hasNoAttribution = mapping.aggregate?.hasAttribution
                ? []
                : [11];
            if (mapping.dataSource === "api") {
                return (
                    [1, 2, 3, ...prefetch, ...hasAttribution].indexOf(id) !== -1
                );
            }

            if (mapping.dataSource === "dhis2-data-set") {
                return (
                    [5, 12, ...notPrefetch, ...hasNoAttribution].indexOf(id) ===
                    -1
                );
            }
            if (mapping.dataSource === "dhis2-indicators") {
                return (
                    [4, 11, 12, ...notPrefetch, ...hasNoAttribution].indexOf(
                        id
                    ) === -1
                );
            }
            if (mapping.dataSource === "dhis2-program-indicators") {
                return (
                    [4, 11, 12, ...notPrefetch, ...hasNoAttribution].indexOf(
                        id
                    ) === -1
                );
            }
            if (
                mapping.dataSource &&
                ["csv-line-list", "xlsx-line-list"].indexOf(
                    mapping.dataSource
                ) !== -1
            ) {
                return [4, 7, 12, ...hasNoAttribution].indexOf(id) === -1;
            }
            if (mapping.dataSource === "manual-dhis2-program-indicators") {
                return [3, 4, 11, 6, 9, ...hasNoAttribution].indexOf(id) === -1;
            }
            return [4, 12, ...hasNoAttribution].indexOf(id) === -1;
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
            resource: `dataStore/iw-mapping/${mapping.id}`,
            data: {
                ...mapping,
                lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                ...names,
                type: "aggregate",
            },
        };
        const mutation2: any = {
            type,
            resource: `dataStore/iw-ou-mapping/${mapping.id}`,
            data: organisationUnitMapping,
        };
        const mutation3: any = {
            type,
            resource: `dataStore/iw-attribute-mapping/${mapping.id}`,
            data: attributeMapping,
        };
        const mutation4: any = {
            type,
            resource: `dataStore/iw-attribution-mapping/${mapping.id}`,
            data: attributionMapping,
        };

        await Promise.all([
            engine.mutate(mutation),
            engine.mutate(mutation2),
            engine.mutate(mutation3),
            engine.mutate(mutation4),
        ]);

        actionApi.edit();
        toast({
            title: "Mapping saved",
            description: "Mapping has been successfully saved",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
    };
    const onFinish = async () => {
        mappingApi.reset({ type: "aggregate" });
        $attributeMapping.reset();
        $organisationUnitMapping.reset();
        $data.reset();
        $dataSet.reset();
        $dhis2DataSet.reset();
    };

    useEffect(() => {
        mappingApi.update({
            attribute: "type",
            value: "aggregate",
        });
        if (!mapping.created) {
            mappingApi.updateMany({
                created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });
        }
    }, []);

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
