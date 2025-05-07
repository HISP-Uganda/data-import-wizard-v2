import { Checkbox, Stack, Text } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { mappingApi } from "../../Events";
import { $mapping } from "../../Store";
import NumberProperty from "../mapping-fields/NumberProperty";
import SwitchComponent, { Case } from "../SwitchComponent";

export default function DHIS2AsDestinationOptions() {
    const mapping = useStore($mapping);
    if (!mapping.isSource)
        return (
            <Stack
                spacing="30px"
                borderWidth="2px"
                borderRadius="lg"
                borderColor="gray.200"
                _hover={{ borderColor: "blue.500" }}
                transition="all 0.2s"
                px={4}
                py={2}
                boxShadow="sm"
            >
                <Text>Destination Options</Text>
                <Stack>
                    <Checkbox
                        isChecked={mapping.dhis2DestinationOptions?.async}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            mappingApi.update({
                                attribute: "dhis2DestinationOptions",
                                path: "async",
                                value: e.target.checked,
                            })
                        }
                    >
                        Asynchronous
                    </Checkbox>

                    <NumberProperty
                        title="Destination Chunk Size"
                        attribute="dhis2DestinationOptions"
                        min={5}
                        step={1}
                        value={mapping.dhis2DestinationOptions?.chunkSize}
                        onChange={(value) =>
                            mappingApi.update({
                                attribute: "dhis2DestinationOptions",
                                path: "chunkSize",
                                value,
                            })
                        }
                    />
                    <SwitchComponent condition={mapping.type === "aggregate"}>
                        <Case value={true}>
                            <Checkbox
                                isChecked={
                                    mapping.dhis2DestinationOptions
                                        ?.completeDataSet
                                }
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    mappingApi.update({
                                        attribute: "dhis2DestinationOptions",
                                        path: "completeDataSet",
                                        value: e.target.checked,
                                    })
                                }
                            >
                                Complete Data Set
                            </Checkbox>
                        </Case>
                        <Case default>
															
                            <Stack direction="row">
                                <Checkbox
                                    isChecked={
                                        mapping.dhis2DestinationOptions
                                            ?.skipPatternValidation
                                    }
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        mappingApi.update({
                                            attribute:
                                                "dhis2DestinationOptions",
                                            path: "skipPatternValidation",
                                            value: e.target.checked,
                                        })
                                    }
                                >
                                    Skip Pattern Validation
                                </Checkbox>
                                <Checkbox
                                    isChecked={
                                        mapping.dhis2DestinationOptions
                                            ?.skipRuleEngine
                                    }
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        mappingApi.update({
                                            attribute:
                                                "dhis2DestinationOptions",
                                            path: "skipRuleEngine",
                                            value: e.target.checked,
                                        })
                                    }
                                >
                                    Skip Program Rules Engine
                                </Checkbox>
                                <Checkbox
                                    isChecked={
                                        mapping.dhis2DestinationOptions
                                            ?.skipSideEffects
                                    }
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        mappingApi.update({
                                            attribute:
                                                "dhis2DestinationOptions",
                                            path: "skipSideEffects",
                                            value: e.target.checked,
                                        })
                                    }
                                >
                                    Skip Side Effects
                                </Checkbox>
                            </Stack>
                        </Case>
                    </SwitchComponent>
                </Stack>
            </Stack>
        );

    return null;
}
