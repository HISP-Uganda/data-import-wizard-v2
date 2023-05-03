// import i18n from '@dhis2/d2-i18n'
import App from "./components/App";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const theme = extendTheme();
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

const AppWrapper = () => (
    <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </ChakraProvider>
);
export default AppWrapper;
