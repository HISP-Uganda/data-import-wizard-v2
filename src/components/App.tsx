import React from "react";
import { ReactNode } from "react";
import {
    Box,
    Spinner,
    Stack,
    HStack,
    Flex,
    Text,
    Button,
    // Link,
    useColorModeValue,
} from "@chakra-ui/react";
import {
    createHashHistory,
    Outlet,
    parseSearchWith,
    ReactLocation,
    Route,
    Link,
    Router,
    stringifySearchWith,
    useSearch,
} from "@tanstack/react-location";

import { LocationGenerics } from "../Interfaces";
import { decodeFromBinary, encodeToBinary } from "../utils/utils";
import Aggregate from "./Aggregate";
import Program from "./Program";
import Schedule from "./Schedule";
import Organisation from "./Orgainsation";
import Home from "./Home";
import { useEffect } from "react";
import NavBar from "./NavBar";

const Links = [
    { path: "/program", name: "Tracker", icon: "" },
    { path: "/aggregate", name: "Aggregate", icon: "" },
    { path: "/schedule", name: "Schedule", icon: "" },
    { path: "/organisation", name: "Organisation", icon: "" },
];

type NavLinkProps = {
    href?: string;
    children: ReactNode;
    onClick?: (params: any) => any;
};
const NavLink = ({ href, children, onClick }: NavLinkProps) => (
    <Button
        px={2}
        py={1}
        rounded={"md"}
        fontWeight={"small"}
        _hover={{
            textDecoration: "none",
            bg: useColorModeValue("gray.200", "gray.700"),
        }}
        onClick={onClick}
    >
        {children}
    </Button>
);

const history = createHashHistory();
const location = new ReactLocation<LocationGenerics>({
    history,
    parseSearch: parseSearchWith((value) =>
        JSON.parse(decodeFromBinary(value))
    ),
    stringifySearch: stringifySearchWith((value) =>
        encodeToBinary(JSON.stringify(value))
    ),
});

const routes: Route<LocationGenerics>[] = [
    {
        path: "/",
        element: <Home />,
        loader: async () => {
            console.log("Load");
            return {};
        },
    },
    {
        path: "/aggregate",
        children: [
            {
                path: "/",
                element: <Aggregate />,
            },
        ],
    },
    {
        path: "/program",
        children: [
            {
                path: "/",
                element: <Program />,
            },
        ],
    },
    {
        path: "/organisation",
        children: [
            {
                path: "/",
                element: <Organisation />,
            },
        ],
    },
    {
        path: "/schedules",
        children: [
            {
                path: "/",
                element: <Schedule />,
            },
        ],
    },
];
const App = () => {
    // const { isLoading, isSuccess, isError, error } = useInitials();
    // const search = useSearch<LocationGenerics>();

    return (
        <>
            <Router
                location={location}
                routes={routes}
                defaultPendingElement={<Spinner />}
            >
                <NavBar />
                <Outlet />
            </Router>
        </>
    );
};

export default App;
