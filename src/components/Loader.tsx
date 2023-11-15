import { Stack, Spinner, Text } from "@chakra-ui/react";
import { message } from "antd";
import React from "react";

export default function Loader({ message }: { message?: string }) {
    return (
        <Stack w="100%" h="100%" alignItems="center" justifyContent="center">
            <Spinner />
            <Text fontSize="18px">{message}</Text>
        </Stack>
    );
}
