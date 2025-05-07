import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-location";
import { Step } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { mappingApi } from "../Events";
import { LocationGenerics } from "../Interfaces";
import { $steps, stepper } from "../Store";
export default function StepperButtons({
    steps,
    disabled,
    onNext,
    onSave,
    onFinish,
}: {
    steps: Step[];
    disabled: boolean;
    onNext: () => void;
    onSave: () => Promise<void>;
    onFinish: () => Promise<void>;
}) {
    const activeStep = useStore($steps);
    const navigate = useNavigate<LocationGenerics>();
    const step = steps[activeStep];
    return (
        <>
            {activeStep === steps.length - 1 ? (
                <Box textAlign="right">
                    <Button
                        colorScheme="blue"
                        onClick={async () => {
                            await onSave();
                            mappingApi.reset({});
                            navigate({ to: "/mappings" });
                        }}
                    >
                        <Text>{step.lastLabel}</Text>
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
                        colorScheme="blue"
                    >
                        Previous Step
                    </Button>

                    <Stack direction="row" spacing="30px">
                        <Button
                            colorScheme="red"
                            onClick={() => {
                                mappingApi.reset({});
                                navigate({ to: "/mappings" });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button colorScheme="green" onClick={() => onSave()}>
                            Save
                        </Button>
                    </Stack>

                    <Button
                        colorScheme="blue"
                        onClick={onNext}
                        isDisabled={disabled}
                    >
                        {step.nextLabel}
                    </Button>
                </Stack>
            )}
        </>
    );
}
