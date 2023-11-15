import { Box, Stack, Text } from "@chakra-ui/react";
import { Step } from "data-import-wizard-utils";
import { stepper } from "../Store";

export default function StepsDisplay({
    activeSteps,
    disabled,
    activeStep,
}: {
    activeSteps: () => Step[];
    disabled: boolean;
    activeStep: number;
}) {
    return (
        <>
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
        </>
    );
}
