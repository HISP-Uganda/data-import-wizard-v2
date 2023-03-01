import { Step, Steps, useSteps } from "chakra-ui-steps";
import {VStack, Flex, Box, Button, HStack, Stack, Text} from "@chakra-ui/react";
import {useState} from "react";
import Wizard from "./components/Wizard";
import Step2 from "./components/program/step2";

interface step {
    label: string;
    content: JSX.Element
}
const Stepper = () => {
    const { nextStep, prevStep, reset, activeStep } = useSteps({
        initialStep: 0
    });
    const [nextStepActive, setNextStepActive] = useState(false);

    const steps: step[] = [
        {label: "Saved Mapping", content: <Text>Saved Mapping</Text>},
        {label: "Select Program", content: <Step2/>},
        {label: "Import Type", content: <Text> Import Type </Text>},
        {label: "Data Options", content: <Text>Data Options</Text>},
        {label: "Map Program Attributes", content: <Text>Map Program Attributes</Text>},
        {label: "Map Program Stages", content: <Text>Map Program Stages</Text>},
        {label: "Import Data", content: <Text>Import Data</Text>},
        {label: "Import Summary", content: <Text>Import Summary</Text>},
    ];

    return (
        <Flex flexDir="column" width="100%">
            <Steps activeStep={activeStep} >

                {steps.map(({ label, content }) => (
                    <Step label={label} key={label}>
                        {content}
                    </Step>
                ))}
            </Steps>
            {activeStep === steps.length ? (
                <Flex p={4}>
                    <Button mx="auto" size="sm" onClick={reset}>
                        <Text>RESET</Text>
                    </Button>
                </Flex>
            ) : (
                <Flex width="100%" justify={"space-between"}>
                    <Button
                        isDisabled={activeStep === 0}
                        alignSelf="flex-end"
                        mt="24px"
                        w={{ sm: "75px", lg: "100px" }}
                        h="35px"
                        onClick={prevStep}
                    >
                        <Text fontSize="xs" color="gray.700" fontWeight="bold">
                            PREV
                        </Text>
                    </Button>
                    <Button
                        variant="no-hover"
                        bg="linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
                        alignSelf="flex-end"
                        mt="24px"
                        w={{ sm: "75px", lg: "100px" }}
                        h="35px"
                        onClick={nextStep}
                    >
                        <Text fontSize="xs" color="#fff" fontWeight="bold">
                            {activeStep === steps.length - 1 ? "FINISH" : "NEXT"}
                        </Text>
                    </Button>
                </Flex>
            )}

        </Flex>
    );
};

export default Stepper;
