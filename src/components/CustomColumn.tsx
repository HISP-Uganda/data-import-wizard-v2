import {
    Box,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { GroupBase, Select, SingleValue } from "chakra-react-select";
import { createOptions, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { $metadata } from "../Store";

const options = createOptions(["join columns", "extract year", "expression"]);
export default function CustomColumn({
    value,
    customType,
    onTypeUpdate,
    onValueChange,
}: {
    value?: string;
    customType: string;
    onTypeUpdate: (e: SingleValue<Option>) => void;
    onValueChange: (e: string | undefined) => void;
}) {
    const { onClose, isOpen, onOpen } = useDisclosure();
    const metadata = useStore($metadata);

    const getTitle = () => {
        if (value && customType) {
            const values = value
                ?.split(",")
                .map(
                    (a) =>
                        metadata.sourceColumns.find((b) => b.value === a)
                            ?.label ?? "",
                )
                .join(",");
            return `${customType} : ${values || value}`;
        }
        return "Update";
    };

    return (
        <Stack>
            <Button
                size="sm"
                onClick={() => onOpen()}
                textAlign="left"
                justifyContent="flex-start"
            >
                {getTitle()}
            </Button>
            <Modal
                onClose={onClose}
                isOpen={isOpen}
                isCentered
                closeOnOverlayClick={false}
                size="2xl"
            >
                <ModalOverlay />
                <ModalContent w="100%" h="300px">
                    <ModalHeader>Custom Mapping</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody m="0" p="10px">
                        <Stack alignItems="center" w="100%">
                            <Stack w="100%" spacing="10px">
                                <Text>Type</Text>
                                <Box w="100%">
                                    <Select<Option, false, GroupBase<Option>>
                                        value={options.find(
                                            (pt) => pt.value === customType,
                                        )}
                                        onChange={(e) => onTypeUpdate(e)}
                                        options={options}
                                        isClearable
                                    />
                                </Box>
                            </Stack>
                            {customType === "join columns" && (
                                <Stack w="100%">
                                    <Text>Columns</Text>
                                    <Box w="100%">
                                        <Select<Option, true, GroupBase<Option>>
                                            value={metadata.sourceColumns.filter(
                                                (pt) =>
                                                    value
                                                        ?.split(",")
                                                        .indexOf(
                                                            String(pt.value),
                                                        ) !== -1,
                                            )}
                                            isMulti
                                            onChange={(e) =>
                                                onValueChange(
                                                    e
                                                        .map(
                                                            (x) =>
                                                                x.value ?? "",
                                                        )
                                                        .join(","),
                                                )
                                            }
                                            options={metadata.sourceColumns}
                                            isClearable
                                        />
                                    </Box>
                                </Stack>
                            )}

                            {customType === "extract year" && (
                                <Stack w="100%" spacing="10px">
                                    <Text>Type</Text>
                                    <Box w="100%">
                                        <Select<
                                            Option,
                                            false,
                                            GroupBase<Option>
                                        >
                                            value={metadata.sourceColumns.find(
                                                (pt) => pt.value === value,
                                            )}
                                            onChange={(e) => {
                                                onValueChange(e?.value);
                                            }}
                                            options={metadata.sourceColumns}
                                            isClearable
                                        />
                                    </Box>
                                </Stack>
                            )}
                            {customType === "expression" && (
                                <Stack w="100%" spacing="10px">
                                    <Text>Expression</Text>
                                    <Input
                                        value={value}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) => onValueChange(e.target.value)}
                                    />
                                </Stack>
                            )}
                        </Stack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Stack>
    );
}
