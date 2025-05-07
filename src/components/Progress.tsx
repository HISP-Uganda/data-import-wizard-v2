import {
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { CQIDexie } from "../db";

type ProgressProps = {
    isOpen: boolean;
    onClose: () => void;
    db: CQIDexie;
};
const Progress = ({ onClose, isOpen, db }: ProgressProps) => {
    const response = useLiveQuery(() => db.messages.limit(1).first());
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
                        <Spinner color="white" />
                        <Text fontSize="18px">{response?.message}</Text>
                    </Stack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default Progress;
