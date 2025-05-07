// import i18n from '@dhis2/d2-i18n'
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./components/App";

import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

const AppWrapper = () => (
    <ChakraProvider>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </ChakraProvider>
);
export default AppWrapper;
