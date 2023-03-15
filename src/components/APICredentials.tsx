import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
    Checkbox,
    IconButton,
    Input,
    Radio,
    RadioGroup,
    Spacer,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { Event } from "effector";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import { generateUid } from "../utils/uid";

const AddableValues = ({
    label,
    key,
    updateMapping,
    mapping,
}: {
    label: string;
    key: string;
    updateMapping: Event<any>;
    mapping: any;
}) => {
    return (
        <Stack>
            <Stack direction="row" alignItems="center">
                <Text>{label}</Text>
                <Spacer />
                <IconButton
                    bgColor="none"
                    aria-label="add"
                    icon={<AddIcon w={2} h={2} />}
                    onClick={() =>
                        updateMapping({
                            attribute: `authentication.${key}.${generateUid()}`,
                            value: {
                                param: "",
                                value: "",
                                forUpdates: false,
                            },
                        })
                    }
                />
            </Stack>

            <Table colorScheme="facebook" size="sm">
                <Thead>
                    <Tr>
                        <Th w="40%">Param</Th>
                        <Th w="40%">Value</Th>
                        <Th w="10%" textAlign="center">
                            Update Param?
                        </Th>
                        <Th w="10%"></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Object.entries<
                        Partial<{
                            param: string;
                            value: string;
                            forUpdates: boolean;
                        }>
                    >(getOr({}, `authentication.${key}`, mapping)).map(
                        ([parameter, { param, value, forUpdates }]) => (
                            <Tr key={parameter}>
                                <Td>
                                    <Input
                                        value={param}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateMapping({
                                                attribute: `authentication.${key}.${parameter}.param`,
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </Td>
                                <Td>
                                    <Input
                                        value={value}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            updateMapping({
                                                attribute: `authentication.${key}.${parameter}.value`,
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </Td>
                                <Td textAlign="center">
                                    <Checkbox isChecked={forUpdates} />
                                </Td>
                                <Td textAlign="right">
                                    <IconButton
                                        aria-label="delete"
                                        bgColor="none"
                                        icon={<DeleteIcon w={3} h={3} />}
                                        onClick={() => {
                                            const {
                                                [parameter]: toRemove,
                                                ...rest
                                            } = getOr(
                                                {},
                                                `authentication.${key}`,
                                                mapping
                                            );
                                            updateMapping({
                                                attribute: `authentication.${key}`,
                                                value: rest,
                                            });
                                        }}
                                    />
                                </Td>
                            </Tr>
                        )
                    )}
                </Tbody>
            </Table>
        </Stack>
    );
};

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
                        attribute: "authentication.method",
                        value,
                    })
                }
                value={getOr("basic", "authentication.method", mapping)}
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
                    value={getOr("", "authentication.url", mapping)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateMapping({
                            attribute: "authentication.url",
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
                            value={getOr(
                                "",
                                "authentication.username",
                                mapping
                            )}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: "authentication.username",
                                    value: e.target.value,
                                })
                            }
                        />
                    </Stack>

                    <Stack>
                        <Text>Password</Text>
                        <Input
                            value={getOr(
                                "",
                                "authentication.password",
                                mapping
                            )}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                updateMapping({
                                    attribute: "authentication.password",
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
                        value={getOr("", "authentication.header", mapping)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            updateMapping({
                                attribute: "authentication.header",
                                value: e.target.value,
                            })
                        }
                    />
                </Stack>
            )}
        </Stack>
    );
}
