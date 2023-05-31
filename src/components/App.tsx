import { Spinner, Stack } from "@chakra-ui/react";
import {
    createHashHistory,
    Outlet,
    parseSearchWith,
    ReactLocation,
    Route,
    Router,
    stringifySearchWith,
} from "@tanstack/react-location";

import { LocationGenerics } from "../Interfaces";
import { useInitials } from "../Queries";
import { decodeFromBinary, encodeToBinary } from "../utils/utils";
import Aggregate from "./Aggregate";
import Home from "./Home";
import NavBar from "./NavBar";
import Organisation from "./Orgainsation";
import Program from "./Program";
import Schedule from "./Schedule";

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
    const { isLoading, isSuccess, isError, error } = useInitials();
    return (
        <Stack
            h="calc(100vh - 48px)"
            maxH="calc(100vh - 48px)"
            minH="calc(100vh - 48px)"
        >
            {isLoading && (
                <Stack alignItems="center" justifyContent="center" h="100%">
                    <Spinner />
                </Stack>
            )}
            {isSuccess && (
                <Router
                    location={location}
                    routes={routes}
                    defaultPendingElement={<Spinner />}
                >
                    <NavBar />
                    <Outlet />
                </Router>
            )}
            {isError && <pre>{JSON.stringify(error)}</pre>}
        </Stack>
    );
};

export default App;
