import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack,
    StackProps,
    Text,
} from "@chakra-ui/react";
import { MappingEvent } from "data-import-wizard-utils";

export default function NumberProperty({
    attribute,
    title,
    min = 0,
    max = 100,
    step = 1,
    path,
    subPath,
    onChange,
    value,
    ...rest
}: {
    max?: number;
    step?: number;
    min?: number;
    onChange: (value: number) => void;
    value: number | undefined;
} & Omit<MappingEvent, "value"> &
    StackProps) {
    return (
        <Stack {...rest}>
            <Text>{title}</Text>
            <NumberInput
                value={value}
                max={max}
                min={min}
                step={step}
                size="sm"
                onChange={(_, value2: number) => {
                    onChange(value2);
                }}
                flex={1}
            >
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>
        </Stack>
    );
}
