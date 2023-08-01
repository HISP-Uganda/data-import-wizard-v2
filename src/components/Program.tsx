import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Step } from "chakra-ui-steps";
import dayjs from "dayjs";
import { useStore } from "effector-react";

import {
    $attributeMapping,
    $disabled,
    $label,
    $optionMapping,
    $organisationUnitMapping,
    $programMapping,
    $programStageMapping,
    programMappingApi,
} from "../pages/program/Store";
import { $action, $steps, actionApi, stepper } from "../Store";
import DHIS2Options from "./program/DHIS2Options";
import { OtherSystemMapping } from "./program/OtherSystemMapping";
import Preview from "./program/Preview";
import Step0 from "./program/step0";
import Step1 from "./program/step1";
import Step10 from "./program/step10";
import Step2 from "./program/step2";
import Step3 from "./program/step3";
import Step4 from "./program/step4";
import Step5 from "./program/step5";
import Step7 from "./program/step7";
import RemoteOutbreaks from "./RemoteOutbreak";
import RemotePrograms from "./RemoteProgram";

interface Step {
    label: string;
    content: JSX.Element;
    id: number;
}
const Program = () => {
    const toast = useToast();
    const activeStep = useStore($steps);
    const disabled = useStore($disabled);
    const programMapping = useStore($programMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const programStageMapping = useStore($programStageMapping);
    const optionMapping = useStore($optionMapping);
    const label = useStore($label);
    const action = useStore($action);
    const engine = useDataEngine();
    const steps: Step[] = [
        { label: "Saved Mappings", content: <Step0 />, id: 1 },
        { label: "Select Program", content: <Step1 />, id: 2 },
        { label: "Integration Type", content: <Step2 />, id: 3 },
        { label: "Mapping Options", content: <Step10 />, id: 4 },
        { label: "Select Outbreak", content: <RemoteOutbreaks />, id: 5 },
        { label: "Select Program2", content: <RemotePrograms />, id: 6 },
        { label: "Organisation Mapping", content: <Step3 />, id: 7 },
        { label: "System Mapping", content: <OtherSystemMapping />, id: 8 },
        {
            label: "Attribute Mapping",
            content: <Step4 />,
            id: 9,
        },
        {
            label: "Events Mapping",
            content: <Step5 />,
            id: 10,
        },
        { label: "DHIS2 Export Options", content: <DHIS2Options />, id: 11 },
        { label: "Import Preview", content: <Preview />, id: 12 },
        { label: "Import Summary", content: <Step7 />, id: 13 },
    ];

    const activeSteps = () => {
        return steps.filter(({ id }) => {
            if (
                programMapping.dataSource !== "dhis2" &&
                programMapping.isSource
            ) {
                if (programMapping.dataSource === "api") {
                    if (programMapping.prefetch) {
                        return [1, 2, 3, 7, 9, 10, 11].indexOf(id) !== -1;
                    }
                    return [1, 2, 3, 7, 9, 11].indexOf(id) !== -1;
                }
                if (programMapping.dataSource === "godata") {
                    if (programMapping.prefetch) {
                        return (
                            [1, 2, 3, 5, 7, 8, 11, 12, 13].indexOf(id) !== -1
                        );
                    }
                    return [1, 2, 3, 5, 7, 8, 13].indexOf(id) !== -1;
                }
                if (programMapping.prefetch) {
                    return [1, 2, 3, 9, 10, 11].indexOf(id) !== -1;
                }
                return [1, 2, 3, 9, 11].indexOf(id) !== -1;
            }

            if (programMapping.dataSource === "dhis2") {
                return [5, 8, 11].indexOf(id) === -1;
            }
            if (programMapping.dataSource === "godata") {
                return [6, 8, 11].indexOf(id) === -1;
            }
        });
    };

    const onNextClick = () => {
        if (activeStep === 0) {
            programMappingApi.updateMany({
                created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            });
            actionApi.create();
        }
        stepper.next();
    };

    const save = async () => {
        const type = action === "creating" ? "create" : "update";
        const mutation: any = {
            type,
            resource: `dataStore/iw-program-mapping/${programMapping.id}`,
            data: {
                ...programMapping,
                lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            },
        };
        const mutation2: any = {
            type,
            resource: `dataStore/iw-ou-mapping/${programMapping.id}`,
            data: organisationUnitMapping,
        };
        const mutation3: any = {
            type,
            resource: `dataStore/iw-attribute-mapping/${programMapping.id}`,
            data: attributeMapping,
        };
        const mutation4: any = {
            type,
            resource: `dataStore/iw-stage-mapping/${programMapping.id}`,
            data: programStageMapping,
        };
        const mutation5: any = {
            type,
            resource: `dataStore/iw-option-mapping/${programMapping.id}`,
            data: optionMapping,
        };

        const data = await Promise.all([
            engine.mutate(mutation),
            engine.mutate(mutation2),
            engine.mutate(mutation3),
            engine.mutate(mutation4),
            engine.mutate(mutation5),
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

    return (
        <Stack p="20px" spacing="30px" flex={1}>
            <Stack
                direction="row"
                justifyItems="space-between"
                justifyContent="space-between"
                alignItems=""
                spacing="0"
            >
                {activeSteps().map((step, index) => (
                    <Stack
                        alignItems="center"
                        justifyItems="center"
                        alignContent="center"
                        justifyContent="center"
                        flex={1}
                        key={step.label}
                        onClick={() => (disabled ? "" : stepper.goTo(index))}
                        cursor="pointer"
                    >
                        <Box
                            borderRadius="50%"
                            borderColor={
                                index < activeStep
                                    ? "green"
                                    : index === activeStep
                                    ? "orange.600"
                                    : "gray.400"
                            }
                            borderWidth="2px"
                            bg={
                                index < activeStep
                                    ? "green.500"
                                    : index === activeStep
                                    ? "orange.300"
                                    : "white"
                            }
                            h="40px"
                            lineHeight="40px"
                            w="40px"
                        >
                            <Text
                                textAlign="center"
                                color={index <= activeStep ? "white" : ""}
                                fontWeight="bold"
                            >
                                {index + 1}
                            </Text>
                        </Box>
                        <Text>{step.label}</Text>
                    </Stack>
                ))}
            </Stack>
            <Stack flex={1}>{activeSteps()[activeStep]?.content}</Stack>
            {activeStep === steps.length - 1 ? (
                <Box textAlign="right">
                    <Button onClick={() => stepper.reset()}>
                        <Text>Finish</Text>
                    </Button>
                </Box>
            ) : (
                <Stack
                    width="100%"
                    direction="row"
                    alignContent="space-between"
                    justifyContent="space-between"
                >
                    <Button
                        isDisabled={activeStep === 0}
                        onClick={() => stepper.previous()}
                    >
                        Previous Step
                    </Button>

                    {activeStep >= 2 && (
                        <Button onClick={() => save()}>Save</Button>
                    )}

                    <Button onClick={onNextClick} isDisabled={disabled}>
                        {label}
                    </Button>
                </Stack>
            )}
        </Stack>
    );
};

export default Program;
