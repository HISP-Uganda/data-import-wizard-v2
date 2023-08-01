import React from "react";

import {
    Box,
    Button,
    Flex,
    HStack,
    Tooltip,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { useSearch, useNavigate } from "@tanstack/react-location";
import { LocationGenerics } from "../Interfaces";

const NavBar = () => {
    const search = useSearch<LocationGenerics>();
    const navigate = useNavigate();
    return (
        <Box bg={useColorModeValue("gray.100", "gray.900")} px={4} h="48px">
            <Flex h={12} alignItems={"center"} justifyContent={"space-between"}>
                <HStack spacing={8} alignItems={"center"}>
                    <HStack
                        as={"nav"}
                        spacing={4}
                        display={{ base: "none", md: "flex" }}
                    >
                        <Button
                            fontWeight={"small"}
                            onClick={() => {
                                navigate({ to: "", search });
                            }}
                        >
                            Overview
                        </Button>
                        <Tooltip label={"Import data into a tracker or event program"}>
                            <Button
                                fontWeight={"small"}
                                onClick={() => {
                                    navigate({ to: "/program", search });
                                }}
                            >
                                Program
                            </Button>
                        </Tooltip>

                        <Tooltip label={"Import aggregate data"}>
                        <Button
                            fontWeight={"small"}
                            onClick={() => {
                                navigate({ to: "/aggregate", search });
                            }}
                        >
                            Aggregate
                        </Button>
                        </Tooltip>
                        <Tooltip label={"Schedule data import based on saved mapping"}>
                        <Button
                            fontWeight={"small"}
                            onClick={() => {
                                navigate({ to: "/schedules", search });
                            }}
                        >
                            Schedule
                        </Button>
                        </Tooltip>

                        <Tooltip label={"Map and import organisation units"}>
                        <Button
                            fontWeight={"small"}
                            onClick={() => {
                                navigate({ to: "/organisation", search });
                            }}
                        >
                            Organisation
                        </Button>
                        </Tooltip>

                        <Tooltip label={"Browse documentation"}>
                        <Button
                            fontWeight={"small"}
                            onClick={() => {
                                navigate({ to: "/docs", search });
                            }}
                        >
                            Documentation
                        </Button>
                        </Tooltip>

                    </HStack>
                </HStack>
            </Flex>
        </Box>
    );
};

export default NavBar;
