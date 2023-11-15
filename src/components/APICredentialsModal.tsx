import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
} from "@chakra-ui/react";
import { IMapping } from "data-import-wizard-utils";
import { Event } from "effector";
import { getOr } from "lodash/fp";
import { ChangeEvent } from "react";
import APICredentials from "./APICredentials";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    updateMapping: Event<any>;
    onOK: () => void;
    mapping: any;
    accessor: keyof IMapping;
    fetching: boolean;
    labelField?: string;
    valueField?: string;
};

export function APICredentialsModal({
    onClose,
    isOpen,
    updateMapping,
    mapping,
    accessor,
    onOK,
    fetching,
    labelField,
    valueField,
}: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Organisation API endpoint</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Stack spacing="20px">
                        <APICredentials
                            updateMapping={updateMapping}
                            mapping={mapping}
                            accessor={accessor}
                        />
                        {labelField && (
                            <Stack>
                                <Text>Label Field</Text>
                                <Input
                                    value={getOr("", labelField, mapping)}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        updateMapping({
                                            attribute: labelField,
                                            value: e.target.value,
                                        })
                                    }
                                />
                            </Stack>
                        )}
                        {valueField && (
                            <Stack>
                                <Text>Value Field</Text>
                                <Input
                                    value={getOr("", valueField, mapping)}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) =>
                                        updateMapping({
                                            attribute: valueField,
                                            value: e.target.value,
                                        })
                                    }
                                />
                            </Stack>
                        )}
                        <Stack>
                            <Text>Response Key</Text>
                            <Input
                                value={getOr("", "responseKey", mapping)}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    updateMapping({
                                        attribute: "responseKey",
                                        value: e.target.value,
                                    })
                                }
                            />
                        </Stack>
                    </Stack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="red" mr={3} onClick={() => onClose()}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={() => onOK()}
                        isLoading={fetching}
                    >
                        OK
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
