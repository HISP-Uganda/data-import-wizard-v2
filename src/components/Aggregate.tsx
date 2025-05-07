import { Stack, useToast } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Option, Step } from "data-import-wizard-utils";
import dayjs from "dayjs";
import { useStore } from "effector-react";
import {
    $attributeMapping,
    $data,
    $dataSet,
    $dhis2DataSet,
    $disabled,
    $mapping,
    $name,
    $names,
    $optionMapping,
    $organisationUnitMapping,
    $otherName,
} from "../Store";

import { useEffect } from "react";
import { CQIDexie } from "../db";
import { mappingApi } from "../Events";
import { $action, $steps, actionApi, stepper } from "../Store";
import { saveMapping } from "../utils/utils";
import ImportSummary from "./aggregate/AggImportSummary";
import Attribution from "./aggregate/Attribution";
import Configuration from "./aggregate/Configuration";
import DataMapping from "./aggregate/DataMapping";
import DataSetSelect from "./aggregate/DataSetSelect";
import Pivot from "./aggregate/Pivot";
import RemoteDataSetSelect from "./aggregate/RemoteDataSetSelect";
import DataPreview from "./DataPreview";
import ImportExportOptions from "./ImportExportOptions";
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

const Aggregate = ({ db }: { db: CQIDexie }) => {
    const activeStep = useStore($steps);
    const mapping = useStore($mapping);
    const disabled = useStore($disabled);
    const name = useStore($name);
    const action = useStore($action);
    const otherName = useStore($otherName);
    const toast = useToast();
    const names = useStore($names);
    const optionMapping = useStore($optionMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const engine = useDataEngine();
    const steps: Step[] = [
        {
            label: "Mapping Details",
            content: <MappingDetails importTypes={importTypes} db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 2,
        },
        {
            label: `${name} Data Set`,
            content: <DataSetSelect db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 3,
        },
        {
            label: `${otherName} Data Set`,
            content: <RemoteDataSetSelect db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 4,
        },
        {
            label: "Configuration",
            content: <Configuration db={db} />,
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
            content: <OrganisationUnitMapping db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 6,
        },
        {
            label: "Attribution Mapping",
            content: <Attribution db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 11,
        },
        {
            label: "Data Mapping",
            content: <DataMapping db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 7,
        },
        {
            label: "Import/Export Options",
            content: <ImportExportOptions showFileUpload={false} db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 8,
        },
        {
            label: "Preview",
            content: <DataPreview db={db} />,
            lastLabel: "",
            nextLabel: "Import",
            id: 9,
        },
        {
            label: "Import Summary",
            content: <ImportSummary db={db} />,
            lastLabel: "Finish",
            nextLabel: "Next Step",
            id: 10,
        },
    ];

    const activeSteps = () => {
        return steps.filter(({ id }) => {
            const notPrefetch = mapping.prefetch ? [] : [9];
            const prefetch = mapping.prefetch ? [9] : [];
            const hasAttribution = mapping.hasAttribution ? [11] : [];
            const hasNoAttribution = mapping.hasAttribution ? [] : [11];
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
                        id,
                    ) === -1
                );
            }
            if (mapping.dataSource === "dhis2-program-indicators") {
                return (
                    [4, 11, 12, ...notPrefetch, ...hasNoAttribution].indexOf(
                        id,
                    ) === -1
                );
            }
            if (
                mapping.dataSource &&
                ["csv-line-list", "xlsx-line-list"].indexOf(
                    mapping.dataSource,
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
        await saveMapping({
            engine,
            mapping: {
                ...mapping,
                ...names,
            },
            action,
            mappings: {
                organisationUnitMapping,
                attributeMapping,
                optionMapping,
            },
        });

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
