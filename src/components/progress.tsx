import React from "react";

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalOverlay,
    useDisclosure,
    Text,
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import { $iStore } from "../Store";

type ProgressProps = {
    isOpen: boolean;
    onClose: () => any;
    message: string;
};
const Progress = ({ message }: ProgressProps) => {
    const store = useStore($iStore);
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalBody>
                    <Text fontWeight="bold" mb="1rem">
                        &nbsp;&nbsp;{message}
                    </Text>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default Progress;
