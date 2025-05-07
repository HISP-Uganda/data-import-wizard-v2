import { Spinner, Stack } from "@chakra-ui/react";
import {
    createHashHistory,
    Outlet,
    parseSearchWith,
    ReactLocation,
    Router,
    stringifySearchWith,
} from "@tanstack/react-location";
import { ConfigProvider } from "antd";
import { LocationGenerics } from "../Interfaces";
import { useInitials } from "../Queries";
import { stepper } from "../Store";
import { decodeFromBinary, encodeToBinary } from "../utils/utils";
import Aggregate from "./Aggregate";
import DeleteData from "./DeleteData";
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
        JSON.parse(decodeFromBinary(value)),
    ),
    stringifySearch: stringifySearchWith((value) =>
        encodeToBinary(JSON.stringify(value)),
    ),
});

const App = () => {
    const { isLoading, isSuccess, isError, error, data } = useInitials();
    return (
        <ConfigProvider componentSize="large">
            <Stack
                h="calc(100vh - 48px)"
                maxH="calc(100vh - 48px)"
                minH="calc(100vh - 48px)"
            >
                {isLoading && <Loader message="Initializing..." />}
                {isSuccess && (
                    <Router
                        location={location}
                        routes={[
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
                                        element: <Mappings db={data} />,
                                        loader: async () => {
                                            stepper.reset();
                                            return {};
                                        },
                                    },
                                    {
                                        path: "/individual",
                                        element: <Program db={data} />,
                                        loader: async () => {
                                            stepper.reset();
                                            return {};
                                        },
                                    },
                                    {
                                        path: "/aggregate",
                                        element: <Aggregate db={data} />,
                                        loader: async () => {
                                            stepper.reset();
                                            return {};
                                        },
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

                            {
                                path: "/delete",
                                children: [
                                    {
                                        path: "/",
                                        element: <DeleteData db={data} />,
                                    },
                                ],
                            },
                        ]}
                        defaultPendingElement={<Spinner />}
                    >
                        <NavBar />
                        <Outlet />
                    </Router>
                )}
                {isError && <pre>{JSON.stringify(error)}</pre>}
            </Stack>
        </ConfigProvider>
    );
};

export default App;
