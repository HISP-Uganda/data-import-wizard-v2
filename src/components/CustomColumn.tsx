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
import { createOptions, Mapping, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { $metadata } from "../Store";

const options = createOptions([
    "join columns",
    "extract year",
    "specify column",
]);
export default function CustomColumn({
    value,
    mapping,
    onTypeUpdate,
    onValueChange,
}: {
    value: string;
    mapping: Mapping;
    onTypeUpdate: (e: SingleValue<Option>) => void;
    onValueChange: (e: string | undefined) => void;
}) {
    const { onClose, isOpen, onOpen } = useDisclosure();
    const metadata = useStore($metadata);

    const getTitle = () => {
        if (mapping[value].value && mapping[value].customType) {
            const values = mapping[value].value
                ?.split(",")
                .map(
                    (a) =>
                        metadata.sourceColumns.find((b) => b.value === a)
                            ?.label ?? ""
                )
                .join(",");
            return `${mapping[value].customType} : ${values}`;
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
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody m="0" p="10px">
                        <Stack alignItems="center" w="100%">
                            <Stack w="100%">
                                <Text>Type</Text>
                                <Box w="100%">
                                    <Select<Option, false, GroupBase<Option>>
                                        value={options.find(
                                            (pt) =>
                                                pt.value ===
                                                mapping[value].customType
                                        )}
                                        onChange={(e) => onTypeUpdate(e)}
                                        options={options}
                                        isClearable
                                    />
                                </Box>
                            </Stack>
                            {mapping[value].customType === "join columns" && (
                                <Stack w="100%">
                                    <Text>Columns</Text>
                                    <Box w="100%">
                                        <Select<Option, true, GroupBase<Option>>
                                            value={metadata.sourceColumns.filter(
                                                (pt) =>
                                                    mapping[value].value
                                                        ?.split(",")
                                                        .indexOf(
                                                            String(pt.value)
                                                        ) !== -1
                                            )}
                                            isMulti
                                            onChange={(e) =>
                                                onValueChange(
                                                    e
                                                        .map(
                                                            (x) => x.value ?? ""
                                                        )
                                                        .join(",")
                                                )
                                            }
                                            options={metadata.sourceColumns}
                                            isClearable
                                        />
                                    </Box>
                                </Stack>
                            )}

                            {mapping[value].customType === "extract year" && (
                                <Stack w="100%">
                                    <Text>Type</Text>
                                    <Box w="100%">
                                        <Select<
                                            Option,
                                            false,
                                            GroupBase<Option>
                                        >
                                            value={metadata.sourceColumns.find(
                                                (pt) =>
                                                    pt.value ===
                                                    mapping[value].value
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
                            {mapping[value].customType === "specify" && (
                                <Input
                                    value={mapping[value].value}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => onValueChange(e.target.value)}
                                />
                            )}
                        </Stack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Stack>
    );
}
