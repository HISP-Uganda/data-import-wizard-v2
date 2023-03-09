import { Input, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { Event } from "effector";
import { ChangeEvent } from "react";

export default function APICredentials({
    updateMapping,
    mapping,
}: {
    updateMapping: Event<any>;
    mapping: any;
}) {
    return (
        <Stack>
            <RadioGroup
                onChange={(value) =>
                    updateMapping({
                        attribute: "authMethod",
                        value,
                    })
                }
                value={mapping.authMethod}
            >
                <Stack direction="row">
                    <Radio value="basic">Basic Authentication</Radio>
                    <Radio value="authorization">
                        Authorization Header Value
                    </Radio>
                </Stack>
            </RadioGroup>

            <Stack>
                <Text>URL</Text>
                <Input
                    required
                    value={mapping.url}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: "url",
                            value: e.target.value,
                        })
                    }
                />
            </Stack>

            {mapping.authMethod === "basic" ? (
                <>
                    <Stack>
                        <Text>Username</Text>
                        <Input
                            value={mapping.username}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: "username",
                                    value: e.target.value,
                                })
                            }
                        />
                    </Stack>

                    <Stack>
                        <Text>Password</Text>
                        <Input
                            value={mapping.password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: "password",
                                    value: e.target.value,
                                })
                            }
                        />
                    </Stack>
                </>
            ) : (
                <Stack>
                    <Text>Authorization Header Value</Text>
                    <Input
                        value={mapping.header}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateMapping({
                                attribute: "header",
                                value: e.target.value,
                            })
                        }
                    />
                </Stack>
            )}
        </Stack>
    );
}
