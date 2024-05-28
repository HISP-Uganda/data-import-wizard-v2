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
import { IMapping, KeyOptions, MappingEvent } from "data-import-wizard-utils";
import { Event } from "effector";
import { useStore } from "effector-react";
import { mappingApi } from "../../Events";
import { $mapping } from "../../Store";

export default function NumberProperty({
    attribute,
    title,
    min = 0,
    max = 100,
    step = 1,
    path,
    subPath,
    ...rest
}: {
    max?: number;
    step?: number;
    min?: number;
    callback?: () => void;
} & Omit<MappingEvent, "value"> &
    StackProps) {
    const mapping = useStore($mapping);
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
                    mappingApi.update({
                        attribute,
                        value: value2,
                        path,
                        subPath,
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
