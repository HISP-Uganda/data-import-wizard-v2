import { Stack, useDisclosure, useToast } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-location";
import { IProgram, Option, Step } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { LocationGenerics } from "../Interfaces";

import { activeStepsApi, mappingApi, processor, programApi } from "../Events";
import { loadProgram } from "../Queries";
import {
    $action,
    $attributeMapping,
    $data,
    $dhis2Program,
    $disabled,
    $goData,
    $goDataOptions,
    $mapping,
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
    $programStageMapping,
    $programTypes,
    $steps,
    $token,
    $tokens,
    actionApi,
    stepper,
} from "../Store";
import { saveProgramMapping } from "../utils/utils";
import MappingDetails from "./MappingDetails";
import OrganisationUnitMapping from "./OrganisationUnitMapping";
import AttributeMapping from "./program/AttributeMapping";
import DHIS2Options from "./program/DHIS2Options";
import EventMapping from "./program/EventMapping";
import ImportSummary from "./program/ProgramImportSummary";
import MappingOptions from "./program/MappingOptions";
import { OtherSystemMapping } from "./program/OtherSystemMapping";
import Preview from "./program/Preview";
import ProgramSelect from "./program/ProgramSelect";
import RemoteOutbreaks from "./RemoteOutbreak";
import RemoteProgramSelect from "./RemoteProgramSelect";
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
    const programMapping = useStore($mapping);
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
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate<LocationGenerics>();

    const onProgramSelect = async (id?: string) => {
        if (id) {
            onOpen();
            let data = await loadProgram<IProgram>({
                engine,
                id,
                fields: "id,name,trackedEntityType[id,featureType],programType,featureType,organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,repeatable,featureType,name,code,programStageDataElements[id,compulsory,name,dataElement[id,name,code,optionSetValue,optionSet[id,name,options[id,name,code]]]]],programTrackedEntityAttributes[id,mandatory,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
                resource: "programs",
            });
            const other = programMapping.isSource
                ? { source: data.name }
                : { destination: data.name };
            mappingApi.update({
                attribute: "program",
                value: {
                    ...programMapping.program,
                    trackedEntityType: getOr("", "trackedEntityType.id", data),
                    program: id,
                    programType: getOr("", "programType", data),
                    ...other,
                },
            });
            programApi.set(data);
            onClose();
            stepper.next();
        }
    };

    const steps: Step[] = [
        {
            label: "Mapping Details",
            content: <MappingDetails importTypes={importTypes} />,
            id: 2,
            nextLabel: "Next Step",
            lastLabel: "Go to Mappings",
        },
        {
            label: `${name} Program`,
            content: (
                <ProgramSelect
                    isOpen={isOpen}
                    onClose={onClose}
                    onOpen={onOpen}
                    onProgramSelect={onProgramSelect}
                    message="Loading Selected Program"
                />
            ),
            nextLabel: "Next Step",
            id: 3,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Mapping Options",
            content: <MappingOptions />,
            nextLabel: "Next Step",
            id: 4,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Select Outbreak",
            content: <RemoteOutbreaks />,
            nextLabel: "Next Step",
            id: 5,
            lastLabel: "Go to Mappings",
        },
        {
            label: `${otherName} Program`,
            content: <RemoteProgramSelect />,
            nextLabel: "Next Step",
            id: 6,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Organisation Mapping",
            content: <OrganisationUnitMapping />,
            nextLabel: "Next Step",
            id: 7,
            lastLabel: "Go to Mappings",
        },
        {
            label: "System Mapping",
            content: <OtherSystemMapping />,
            nextLabel: "Next Step",
            id: 8,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Attribute Mapping",
            content: <AttributeMapping />,
            nextLabel: "Next Step",
            id: 9,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Events Mapping",
            content: <EventMapping />,
            nextLabel: "Next Step",
            id: 10,
            lastLabel: "Go to Mappings",
        },
        {
            label: "DHIS2 Export Options",
            content: <DHIS2Options />,
            nextLabel: "Next Step",
            id: 11,
            lastLabel: "Export Program",
        },
        {
            label: "Import Preview",
            content: <Preview />,
            nextLabel: "Import",
            id: 12,
            lastLabel: "Go to Mappings",
        },
        {
            label: "Import Summary",
            content: <ImportSummary />,
            nextLabel: "Go to Mappings",
            id: 13,
            lastLabel: "Go to Mappings",
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
                if (
                    programMapping.dataSource &&
                    ["json", "csv-line-list", "xlsx-line-list"].indexOf(
                        programMapping.dataSource
                    ) !== -1
                ) {
                    return [2, 3, 11].indexOf(id) !== -1;
                }
                if (programMapping.prefetch) {
                    return [1, 2, 3, 9, 10, 11].indexOf(id) !== -1;
                }
                return [1, 2, 3, 11].indexOf(id) !== -1;
            }

            if (programMapping.dataSource === "dhis2-program") {
                if (programMapping.prefetch) {
                    return [5, 4, 8].indexOf(id) === -1;
                }
                return [5, 4, 8, 12].indexOf(id) === -1;
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
            mapping: {
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
        // return result;
    };
    const onFinish = async () => {
        if (
            programMapping.isSource &&
            programMapping.dataSource &&
            ["json", "csv-line-list", "xlsx-line-list"].indexOf(
                programMapping.dataSource
            ) !== -1
        ) {
            console.log("We have finished");
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
            $processedGoDataData.reset();
            $token.reset();
            $goDataOptions.reset();
            $dhis2Program.reset();
            stepper.reset();
            navigate({ to: "/mappings" });
        }
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
