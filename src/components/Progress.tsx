import {
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";

type ProgressProps = {
    onOpen: () => void;
    isOpen: boolean;
    onClose: () => void;
    message: string;
};
const Progress = ({ message, onClose, isOpen }: ProgressProps) => {
    return (
        <Modal
            onClose={onClose}
            isOpen={isOpen}
            isCentered
            closeOnOverlayClick={false}
        >
            <ModalOverlay />
            <ModalContent w="100%" boxShadow="none" bg="none">
                <ModalBody m="0" p="10px">
                    <Stack alignItems="center" color="white">
                        <Spinner />
                        <Text fontSize="18px">{message}</Text>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default Progress;
