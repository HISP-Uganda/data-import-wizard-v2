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
import PDF from "../pages/PDF";
import { useInitials } from "../Queries";
import { stepper } from "../Store";
import { decodeFromBinary, encodeToBinary } from "../utils/utils";
import Aggregate from "./Aggregate";
import Home from "./Home";
import Loader from "./Loader";
import Mappings from "./Mappings";
import NavBar from "./NavBar";
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
        path: "/mappings",
        children: [
            {
                path: "/",
                element: <Mappings />,
                loader: async () => {
                    stepper.reset();
                    return {};
                },
            },
            {
                path: "/individual",
                element: <Program />,
                loader: async () => {
                    stepper.reset();
                    return {};
                },
            },
            {
                path: "/aggregate",
                element: <Aggregate />,
                loader: async () => {
                    stepper.reset();
                    return {};
                },
            },
            // {
            //     path: "/organisations",
            //     element: <Aggregate />,
            //     loader: async () => {
            //         stepper.reset();
            //         return {};
            //     },
            // },
            // {
            //     path: "/metadata",
            //     element: <Aggregate />,
            //     loader: async () => {
            //         stepper.reset();
            //         return {};
            //     },
            // },
            // {
            //     path: "/users",
            //     element: <Aggregate />,
            //     loader: async () => {
            //         stepper.reset();
            //         return {};
            //     },
            // },
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
    {
        path: "/docs",
        children: [
            {
                path: "/",
                element: <PDF />,
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
            {isLoading && <Loader message="Initializing..." />}
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
