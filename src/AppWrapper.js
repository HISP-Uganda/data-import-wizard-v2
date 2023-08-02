// import i18n from '@dhis2/d2-i18n'
import App from "./components/App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "focus-visible/dist/focus-visible";
import { Global, css } from "@emotion/react";

import "@fontsource/roboto/index.css";

const GlobalStyles = css`
    .js-focus-visible :focus:not([data-focus-visible-added]) {
        outline: none;
        box-shadow: none;
    }
`;

const theme = extendTheme({
    fonts: {
        heading: `roboto`,
        body: `roboto`,
    },
});
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
            <Global styles={GlobalStyles} />
            <App />
        </QueryClientProvider>
    </ChakraProvider>
);
export default AppWrapper;
