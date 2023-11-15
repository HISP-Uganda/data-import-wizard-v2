import { Spacer, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { Link, useSearch } from "@tanstack/react-location";
import { LocationGenerics } from "../Interfaces";

const NavBar = () => {
    const search = useSearch<LocationGenerics>();
    return (
        <Stack
            direction="row"
            bg={useColorModeValue("gray.200", "gray.900")}
            alignItems="center"
            h="48px"
            minH="48px"
            spacing="50px"
            px="50px"
        >
            <Link<LocationGenerics>
                to=""
                search={search}
                activeOptions={{}}
                getActiveProps={() => ({ className: "active" })}
            >
                <Text textTransform="uppercase" letterSpacing="wider">
                    Overview
                </Text>
            </Link>

            <Link<LocationGenerics>
                to="/mappings"
                search={search}
                activeOptions={{}}
                getActiveProps={() => ({ className: "active" })}
            >
                <Text textTransform="uppercase" letterSpacing="wider">
                    Mappings
                </Text>
            </Link>

            <Link<LocationGenerics>
                to="/schedules"
                search={search}
                activeOptions={{}}
                getActiveProps={() => ({ className: "active" })}
            >
                <Text textTransform="uppercase" letterSpacing="wider">
                    Schedules
                </Text>
            </Link>

            <Spacer />

            <Link<LocationGenerics>
                to="/docs"
                search={search}
                activeOptions={{}}
                getActiveProps={() => ({ className: "active" })}
            >
                <Text textTransform="uppercase" letterSpacing="wider">
                    Documentation
                </Text>
            </Link>
        </Stack>
    );
};

export default NavBar;
