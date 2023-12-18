import { Stack, useToast } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Option, Step } from "data-import-wizard-utils";
import dayjs from "dayjs";
import { useStore } from "effector-react";

import {
    $attributeMapping,
    $data,
    $dhis2Program,
    $disabled,
    $goData,
    $goDataOptions,
    $metadata,
    $name,
    $names,
    $optionMapping,
    $organisationUnitMapping,
    $otherName,
    $prevGoData,
    $processed,
    $processedGoDataData,
    $program,
    $programMapping,
    $programStageMapping,
    $programTypes,
    $token,
    $tokens,
    activeStepsApi,
    processor,
    programMappingApi,
} from "../pages/program";
import { $action, $steps, actionApi, stepper } from "../Store";
import { saveProgramMapping } from "../utils/utils";
import MappingDetails from "./MappingDetails";
import OrganisationUnitMapping from "./OrganisationUnitMapping";
import AttributeMapping from "./program/AttributeMapping";
import DHIS2Options from "./program/DHIS2Options";
import EventMapping from "./program/EventMapping";
import ImportSummary from "./program/ImportSummary";
import MappingOptions from "./program/MappingOptions";
import { OtherSystemMapping } from "./program/OtherSystemMapping";
import Preview from "./program/Preview";
import ProgramSelect from "./program/ProgramSelect";
import RemoteOutbreaks from "./RemoteOutbreak";
import RemotePrograms from "./RemoteProgram";
import StepperButtons from "./StepperButtons";
import StepsDisplay from "./StepsDisplay";

const importTypes: Option[] = [
    { value: "dhis2-program", label: "dhis2-program" },
    { value: "api", label: "api" },
    { value: "json", label: "json" },
    { value: "go-data", label: "go-data" },
    { value: "csv-line-list", label: "csv-line-list" },
    { value: "xlsx-line-list", label: "xlsx-line-list" },
];

const Program = () => {
    const toast = useToast();
    const activeStep = useStore($steps);
    const disabled = useStore($disabled);
    const programMapping = useStore($programMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const programStageMapping = useStore($programStageMapping);
    const optionMapping = useStore($optionMapping);
    const name = useStore($name);
    const otherName = useStore($otherName);
    const action = useStore($action);
    const engine = useDataEngine();
    const names = useStore($names);
    const { sourceOrgUnits, destinationOrgUnits } = useStore($metadata);
    const steps: Step[] = [
        {
            label: "Mapping Details",
            content: (
                <MappingDetails
                    mapping={programMapping}
                    updater={programMappingApi.update}
                    importTypes={importTypes}
                />
            ),
            id: 2,
            nextLabel: "Next Step",
        },
        {
            label: `${name} Program`,
            content: <ProgramSelect />,
            nextLabel: "Next Step",
            id: 3,
        },
        {
            label: "Mapping Options",
            content: <MappingOptions />,
            nextLabel: "Next Step",
            id: 4,
        },
        {
            label: "Select Outbreak",
            content: <RemoteOutbreaks />,
            nextLabel: "Next Step",
            id: 5,
        },
        {
            label: `${otherName} Program`,
            content: <RemotePrograms />,
            nextLabel: "Next Step",
            id: 6,
        },
        {
            label: "Organisation Mapping",
            content: (
                <OrganisationUnitMapping
                    mapping={programMapping}
                    sourceOrgUnits={sourceOrgUnits}
                    destinationOrgUnits={destinationOrgUnits}
                    update={programMappingApi.update}
                />
            ),
            nextLabel: "Next Step",
            id: 7,
        },
        {
            label: "System Mapping",
            content: <OtherSystemMapping />,
            nextLabel: "Next Step",
            id: 8,
        },
        {
            label: "Attribute Mapping",
            content: <AttributeMapping />,
            nextLabel: "Next Step",
            id: 9,
        },
        {
            label: "Events Mapping",
            content: <EventMapping />,
            nextLabel: "Next Step",
            id: 10,
        },
        {
            label: "DHIS2 Export Options",
            content: <DHIS2Options />,
            nextLabel: "Next Step",
            id: 11,
        },
        {
            label: "Import Preview",
            content: <Preview />,
            nextLabel: "Import",
            id: 12,
        },
        {
            label: "Import Summary",
            content: <ImportSummary />,
            nextLabel: "Go to Mappings",
            id: 13,
        },
    ];

    const activeSteps = () => {
        const activeSteps = steps.filter(({ id }) => {
            if (
                programMapping.dataSource !== "dhis2-program" &&
                programMapping.isSource
            ) {
                if (programMapping.dataSource === "api") {
                    if (programMapping.prefetch) {
                        return [1, 2, 3, 7, 9, 10, 11].indexOf(id) !== -1;
                    }
                    return [1, 2, 3, 7, 9, 11].indexOf(id) !== -1;
                }
                if (programMapping.dataSource === "go-data") {
                    if (programMapping.isSource) {
                        return (
                            [1, 2, 3, 5, 7, 8, 11, 12, 13].indexOf(id) !== -1
                        );
                    } else {
                        if (programMapping.prefetch) {
                            return (
                                [1, 2, 3, 5, 7, 8, 11, 12, 13].indexOf(id) !==
                                -1
                            );
                        }
                        return [1, 2, 3, 5, 7, 8, 13].indexOf(id) !== -1;
                    }
                }
                if (programMapping.prefetch) {
                    return [1, 2, 3, 9, 10, 11].indexOf(id) !== -1;
                }
                return [1, 2, 3, 11].indexOf(id) !== -1;
            }

            if (programMapping.dataSource === "dhis2-program") {
                return [5, 4, 8, 11].indexOf(id) === -1;
            }
            if (programMapping.dataSource === "go-data") {
                if (
                    programMapping.program?.programType ===
                    "WITHOUT_REGISTRATION"
                ) {
                    return [4, 6, 8, 9, 11].indexOf(id) === -1;
                }
                return [4, 6, 8, 11].indexOf(id) === -1;
            }

            return [1, 2, 3, 4, 7, 9, 10, 12, 13].indexOf(id) !== -1;
        });
        activeStepsApi.set(activeSteps);
        return activeSteps;
    };

    const onNext = () => {
        if (activeStep === activeSteps().length - 1) {
            processor.reset();
            stepper.reset();
        } else {
            stepper.next();
        }
    };

    const onSave = async () => {
        const result = await saveProgramMapping({
            engine,
            programMapping: {
                ...programMapping,
                ...names,
                type: "individual",
            },
            action,
            organisationUnitMapping,
            programStageMapping,
            attributeMapping,
            optionMapping,
        });

        actionApi.edit();
        toast({
            title: "Mapping saved",
            description: "Mapping has been successfully saved",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
        return result;
    };
    const onFinish = () => {
        programMappingApi.reset();
        $attributeMapping.reset();
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
        $processedGoDataData.reset();
        $token.reset();
        $goDataOptions.reset();
        $dhis2Program.reset();
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
