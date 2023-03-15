import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { Step } from "chakra-ui-steps";
import { useStore } from "effector-react";
import { setNext, setPrevious } from "../Events";
import { setMapping } from "../pages/program/Events";
import { $disabled } from "../pages/program/Store";
import { $steps } from "../Store";
import { generateUid } from "../utils/uid";
import Step0 from "./program/step0";
import Step1 from "./program/step1";
import Step10 from "./program/Step10";
import Step2 from "./program/step2";
import Step3 from "./program/step3";
import Step4 from "./program/step4";
import Step5 from "./program/step5";
import Step6 from "./program/step6";

interface Step {
    label: string;
    content: JSX.Element;
}
const Program = () => {
    const activeStep = useStore($steps);
    const disabled = useStore($disabled);
    const steps: Step[] = [
        { label: "Saved Mapping", content: <Step0 /> },
        { label: "Select Program", content: <Step1 /> },
        { label: "Import Type", content: <Step2 /> },
        { label: "Mapping Options", content: <Step10 /> },
        { label: "Data Options", content: <Step3 /> },
        {
            label: "Map Program Attributes",
            content: <Step4 />,
        },
        {
            label: "Map Program Stages",
            content: <Step5 />,
        },
        { label: "Import Data", content: <Step6 /> },
        { label: "Import Summary", content: <Text>Import Summary</Text> },
    ];

    const onNextClick = () => {
        if (activeStep === 0) {
            setMapping({ id: generateUid() });
        }
        setNext();
    };

    return (
        <Stack p="10px" spacing="30px">
            <Stack
                direction="row"
                justifyItems="space-between"
                justifyContent="space-between"
                alignItems=""
                spacing="0"
            >
                {steps.map((step, index) => (
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
            <Stack>{steps[activeStep].content}</Stack>
            {activeStep === steps.length ? (
                <Flex p={4}>
                    <Button mx="auto" size="sm">
                        <Text>Reset</Text>
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
                        onClick={() => setPrevious()}
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
                        onClick={onNextClick}
                        isDisabled={disabled}
                    >
                        <Text fontSize="xs" color="#fff" fontWeight="bold">
                            Next
                        </Text>
                    </Button>
                </Flex>
            )}
        </Stack>
    );
};

export default Program;
