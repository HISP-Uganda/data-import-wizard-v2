import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Step } from "chakra-ui-steps";
import { useStore } from "effector-react";

import {
    $attributeMapping,
    $disabled,
    $label,
    $organisationUnitMapping,
    $programMapping,
    $programStageMapping,
} from "../pages/program/Store";
import { $steps, stepper } from "../Store";
import { OtherSystemMapping } from "./program/OtherSystemMapping";
import Step0 from "./program/step0";
import Step1 from "./program/step1";
import Step10 from "./program/step10";
import Step2 from "./program/step2";
import Step3 from "./program/step3";
import Step4 from "./program/step4";
import Step5 from "./program/step5";
import Step6 from "./program/step6";
import Step7 from "./program/step7";

interface Step {
    label: string;
    content: JSX.Element;
    id: number;
}
const Program = () => {
    const activeStep = useStore($steps);
    const disabled = useStore($disabled);
    const programMapping = useStore($programMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const programStageMapping = useStore($programStageMapping);
    const label = useStore($label);
    const engine = useDataEngine();

    const steps: Step[] = [
        { label: "Saved Mapping", content: <Step0 />, id: 1 },
        { label: "Select Program", content: <Step1 />, id: 2 },
        { label: "Import Type", content: <Step2 />, id: 3 },
        { label: "Mapping Options", content: <Step10 />, id: 4 },
        { label: "Organisation Mapping", content: <Step3 />, id: 5 },
        { label: "System Mapping", content: <OtherSystemMapping />, id: 6 },
        {
            label: "Registration Mapping",
            content: <Step4 />,
            id: 7,
        },
        {
            label: "Events Mapping",
            content: <Step5 />,
            id: 8,
        },
        { label: "Import Preview", content: <Step6 />, id: 9 },
        { label: "Import Summary", content: <Step7 />, id: 10 },
    ];

    const onNextClick = () => {
        stepper.next();
    };

    const save = async () => {
        const mutation: any = {
            type: "create",
            resource: `dataStore/iw-program-mapping/${programMapping.id}`,
            data: programMapping,
        };
        const mutation2: any = {
            type: "create",
            resource: `dataStore/iw-ou-mapping/${programMapping.id}`,
            data: organisationUnitMapping,
        };
        const mutation3: any = {
            type: "create",
            resource: `dataStore/iw-attribute-mapping/${programMapping.id}`,
            data: attributeMapping,
        };
        const mutation4: any = {
            type: "create",
            resource: `dataStore/iw-stage-mapping/${programMapping.id}`,
            data: programStageMapping,
        };
        return await Promise.all([
            engine.mutate(mutation),
            engine.mutate(mutation2),
            engine.mutate(mutation3),
            engine.mutate(mutation4),
        ]);
    };

    return (
        <Stack p="10px" spacing="30px" flex={1}>
            <Stack
                direction="row"
                justifyItems="space-between"
                justifyContent="space-between"
                alignItems=""
                spacing="0"
            >
                {steps
                    .filter(({ id }) => {
                        if (
                            !programMapping.isDHIS2 &&
                            programMapping.isSource
                        ) {
                            return [1, 2, 3, 5, 6, 10].indexOf(id) !== -1;
                        }
                        return id !== 6;
                    })
                    .map((step, index) => (
                        <Stack
                            alignItems="center"
                            justifyItems="center"
                            alignContent="center"
                            justifyContent="center"
                            flex={1}
                            key={step.label}
                        >
                            <Box
                                borderRadius="50%"
                                borderColor="blue"
                                borderWidth="1px"
                                bg="red.100"
                                h="40px"
                                lineHeight="40px"
                                w="40px"
                            >
                                <Text textAlign="center">{index + 1}</Text>
                            </Box>
                            <Text bg={index === activeStep ? "yellow" : ""}>
                                {step.label}
                            </Text>
                        </Stack>
                    ))}
            </Stack>
            <Stack flex={1}>
                {
                    steps.filter(({ id }) => {
                        if (
                            !programMapping.isDHIS2 &&
                            programMapping.isSource
                        ) {
                            return [1, 2, 3, 5, 6, 10].indexOf(id) !== -1;
                        }
                        return id !== 6;
                    })[activeStep]?.content
                }
            </Stack>
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
                        Previous
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
