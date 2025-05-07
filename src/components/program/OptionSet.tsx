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
	Table,
	Tbody,
	Td,
	Th,
	Thead,
	Tr
} from "@chakra-ui/react";
import { CommonIdentifier } from "data-import-wizard-utils";

export default function OptionSet({
    options,
    isOpen,
    onOpen,
    onClose,
}: {
    options: CommonIdentifier[];
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}) {
    return (
        <>
            <Button
                onClick={() => {
                    onOpen();
                }}
            >
                Map Options
            </Button>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th py="20px">Destination Option</Th>
                                    <Th textAlign="center" py="20px">
                                        Source Option
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {options.map(({ name, code }) => (
                                    <Tr key={code}>
                                        <Td w="400px">{name}</Td>
                                        <Td textAlign="center">
                                            <Input />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
