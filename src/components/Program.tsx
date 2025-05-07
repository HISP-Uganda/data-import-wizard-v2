import { Stack, Text, useToast } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-location";
import { isExcel, Option, Step } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { LocationGenerics } from "../Interfaces";

import { CQIDexie } from "../db";
import { activeStepsApi, mappingApi, processor } from "../Events";
import { useOneLiveQuery } from "../hooks/useOneLiveQuery";
import {
    $action,
    $attributeMapping,
    $attributionMapping,
    $data,
    $dhis2Program,
    $disabled,
    $enrollmentMapping,
    $goData,
    $goDataOptions,
    $mapping,
    $name,
    $names,
    $optionMapping,
    $organisationUnitMapping,
    $otherName,
    $prevGoData,
    $processed,
    $program,
    $programStageMapping,
    $programTypes,
    $steps,
    $token,
    $tokens,
    actionApi,
    stepper,
} from "../Store";
import { saveMapping } from "../utils/utils";
import DataPreview from "./DataPreview";
import ImportExportOptions from "./ImportExportOptions";
import MappingDetails from "./MappingDetails";
import OrganisationUnitMapping from "./OrganisationUnitMapping";
import AttributeMapping from "./program/AttributeMapping";
import Columns from "./program/Columns";
import EventMapping from "./program/EventMapping";
import { OtherSystemMapping } from "./program/OtherSystemMapping";
import ImportSummary from "./program/ProgramImportSummary";
import ProgramSelect from "./program/ProgramSelect";
import RemoteOutbreaks from "./RemoteOutbreak";
import RemoteProgramSelect from "./RemoteProgramSelect";
import StepperButtons from "./StepperButtons";
import StepsDisplay from "./StepsDisplay";
import Attribution from "./aggregate/Attribution";

const importTypes: Option[] = [
    { value: "dhis2-program", label: "dhis2-program" },
    { value: "api", label: "api" },
    { value: "json", label: "json" },
    { value: "go-data", label: "go-data" },
    { value: "csv-line-list", label: "csv-line-list" },
    { value: "xlsx-line-list", label: "xlsx-line-list" },
    { value: "fhir", label: "fhir" },
];

const Program = ({ db }: { db: CQIDexie }) => {
    const toast = useToast();
    const activeStep = useStore($steps);
    const disabled = useStore($disabled);
    const mapping = useStore($mapping);
    const name = useStore($name);
    const otherName = useStore($otherName);
    const action = useStore($action);
    const engine = useDataEngine();
    const names = useStore($names);

    const optionMapping = useStore($optionMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const enrollmentMapping = useStore($enrollmentMapping);
    const attributionMapping = useStore($attributionMapping);
    const attributeMapping = useStore($attributeMapping);
    const programStageMapping = useStore($programStageMapping);
    const navigate = useNavigate<LocationGenerics>();

    const levels = useOneLiveQuery<Option>(db.levels.toArray(), []);

    const onNext = () => {
        if (activeStep === activeSteps().length - 1) {
            processor.reset();
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
                programStageMapping,
                enrollmentMapping,
                optionMapping,
                attributionMapping,
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
        if (
            mapping.isSource &&
            mapping.dataSource &&
            ["json", "csv-line-list", "xlsx-line-list"].indexOf(
                mapping.dataSource,
            ) !== -1
        ) {
        } else {
            mappingApi.reset({});
            $attributeMapping.reset();
            $mapping.reset();
            $program.reset();
            $optionMapping.reset();
            $organisationUnitMapping.reset();
            $programStageMapping.reset();
            $processed.reset();
            $prevGoData.reset();
            $data.reset();
            $goData.reset();
            $programTypes.reset();
            $tokens.reset();
            $token.reset();
            $goDataOptions.reset();
            $dhis2Program.reset();
            stepper.reset();
            navigate({ to: "/mappings" });
        }
    };
    if (levels === null) return <Text>Loading...</Text>;

    const steps: Step[] = [
        {
            label: "Mapping Details",
            content: <MappingDetails importTypes={importTypes} db={db} />,
            id: 2,
            nextLabel: "Next Step",
            lastLabel: "Go to Mappings",
        },
        {
            label: `${name} Program`,
            content: <ProgramSelect db={db} />,
            nextLabel: "Next Step",
            id: 3,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Select Outbreak",
            content: <RemoteOutbreaks db={db} />,
            nextLabel: "Next Step",
            id: 5,
            lastLabel: "Go to Mappings",
        },
        {
            label: `${otherName} Program`,
            content: <RemoteProgramSelect db={db} />,
            nextLabel: "Next Step",
            id: 6,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Organisation Mapping",
            content: <OrganisationUnitMapping db={db} />,
            nextLabel: "Next Step",
            id: 7,
            lastLabel: "Go to Mappings",
        },

        {
            label: "System Mapping",
            content: <OtherSystemMapping db={db} />,
            nextLabel: "Next Step",
            id: 8,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Attribute/Enrollment Mapping",
            content: <AttributeMapping db={db} />,
            nextLabel: "Next Step",
            id: 9,
            lastLabel: "Go to Mappings",
        },
        // {
        //     label: "Enrollment Mapping",
        //     content: <EnrollmentMapping db={db} />,
        //     nextLabel: "Next Step",
        //     id: 15,
        //     lastLabel: "Go to Mappings",
        // },
        {
            label: "Events Mapping",
            content: <EventMapping db={db} />,
            nextLabel: "Next Step",
            id: 10,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Attribution Mapping",
            content: <Attribution db={db} />,
            lastLabel: "",
            nextLabel: "Next Step",
            id: 17,
        },

        {
            label: "Columns",
            content: <Columns levels={levels} />,
            nextLabel: "Next Step",
            id: 16,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Import/Export Options",
            content: <ImportExportOptions db={db} />,
            nextLabel: "Next Step",
            id: 11,
            lastLabel: "Export Program",
        },
        {
            label: "Import Preview",
            content: <DataPreview db={db} />,
            nextLabel:
                mapping.isSource &&
                ["csv-line-list", "xlsx-line-list"].indexOf(
                    mapping.dataSource ?? "",
                ) !== -1
                    ? "Download"
                    : mapping.isSource
                    ? "Export"
                    : "Import",
            id: 12,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Import Summary",
            content: <ImportSummary db={db} />,
            nextLabel: "Go to Mappings",
            id: 13,
            lastLabel: "Go to Mappings",
        },
    ];

    const activeSteps = () => {
        const preview = mapping.prefetch ? [12] : [];
        const noPreview = mapping.prefetch ? [] : [12];
        const hasAttribution = mapping.hasAttribution ? [17] : [];
        const hasNoAttribution = mapping.hasAttribution ? [] : [17];
        const orgStep =
            mapping.program?.createEntities ||
            mapping.program?.createEnrollments ||
            mapping.program?.createEvents
                ? [7]
                : [];

        const noOrgStep =
            mapping.program?.createEntities ||
            mapping.program?.createEnrollments ||
            mapping.program?.createEvents
                ? []
                : [7];
        const activeSteps = steps.filter(({ id }) => {
            if (mapping.dataSource !== "dhis2-program" && mapping.isSource) {
                if (mapping.dataSource === "api") {
                    if (mapping.prefetch) {
                        return (
                            [1, 2, 3, ...orgStep, 9, 10, 11, 13].indexOf(id) !==
                            -1
                        );
                    }
                    return (
                        [1, 2, 3, ...orgStep, 9, 11, 13, 16].indexOf(id) !== -1
                    );
                }
                if (mapping.dataSource === "go-data") {
                    if (mapping.isSource) {
                        return (
                            [
                                1,
                                2,
                                3,
                                5,
                                ...orgStep,
                                8,
                                11,
                                12,
                                13,
                                ...hasAttribution,
                            ].indexOf(id) !== -1
                        );
                    } else {
                        return (
                            [
                                1,
                                2,
                                3,
                                5,
                                ...orgStep,
                                8,
                                13,
                                15,
                                ...preview,
                            ].indexOf(id) !== -1
                        );
                    }
                }
                if (mapping.dataSource && isExcel(mapping)) {
                    return [2, 3, 11, 13, 16, ...preview].indexOf(id) !== -1;
                }
                return [1, 2, 3, 11, 13, ...preview].indexOf(id) !== -1;
            }

            if (mapping.dataSource === "dhis2-program") {
                const remove = !mapping.program?.isTracker ? [9, 16] : [16];

                return (
                    [
                        5,
                        ...noOrgStep,
                        8,
                        ...remove,
                        ...noPreview,
                        ...hasNoAttribution,
                    ].indexOf(id) === -1
                );
            }
            if (mapping.dataSource === "go-data") {
                if (!mapping.program?.isTracker) {
                    return (
                        [
                            6,
                            ...noOrgStep,
                            8,
                            9,
                            11,
                            16,
                            ...hasNoAttribution,
                        ].indexOf(id) === -1
                    );
                }
                return (
                    [6, ...noOrgStep, 8, 11, 16, ...hasNoAttribution].indexOf(
                        id,
                    ) === -1
                );
            }
            const include = !mapping.program?.isTracker ? [] : [9];
            return (
                [
                    1,
                    2,
                    3,
                    ...orgStep,
                    ,
                    10,
                    11,
                    12,
                    13,
                    ...include,
                    ...hasAttribution,
                ].indexOf(id) !== -1
            );
        });
        activeStepsApi.set(activeSteps);
        return activeSteps;
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

export default Program;
