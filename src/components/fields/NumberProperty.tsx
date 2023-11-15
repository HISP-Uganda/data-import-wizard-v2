import {
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack,
    Text,
    StackProps,
} from "@chakra-ui/react";
import { Event } from "effector";
import { IMapping } from "data-import-wizard-utils";
import React from "react";

export default function NumberProperty<U extends IMapping>({
    mapping,
    attribute,
    title,
    min = 0,
    max = 100,
    step = 1,
    api,
    ...rest
}: {
    max?: number;
    step?: number;
    min?: number;
    mapping: Partial<U>;
    api: Event<{
        attribute: keyof U;
        value: any;
        key?: string;
    }>;
    attribute: keyof U;
    callback?: () => void;
} & StackProps) {
    return (
        <Stack {...rest}>
            <Text>{title}</Text>
            <NumberInput
                value={Number(mapping[attribute])}
                max={max}
                min={min}
                step={step}
                size="sm"
                onChange={(value1: string, value2: number) =>
                    api({
                        attribute: attribute,
                        value: value2,
                    })
                }
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
