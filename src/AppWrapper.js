// import i18n from '@dhis2/d2-i18n'
import App from "./components/App";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StepsStyleConfig as Steps } from "chakra-ui-steps";

const CustomSteps = {
    ...Steps,
    baseStyle: (props) => {
        return {
            ...Steps.baseStyle(props),
            icon: {
                ...Steps.baseStyle(props).icon,
                // your custom styles here
                strokeWidth: "1px",
            },
        };
    },
    sizes: {
        ...Steps.sizes,
        sm: {
            ...Steps.sizes.sm,
            icon: {
                ...Steps.sizes.sm.icon,
                width: "10px",
                height: "10px",
            },
            label: {
                ...Steps.sizes.sm.label,
                fontWeight: "small",
            },
        },
        md: {
            ...Steps.sizes.md,
            icon: {
                ...Steps.sizes.md.icon,
                width: "10px",
                height: "10px",
            },
            label: {
                ...Steps.sizes.md.label,
                fontWeight: "medium",
            },
            stepIconContainer: {
                width: "25px",
                height: "25px",
                borderWidth: "2px",
            },
        },
    },
};

const theme = extendTheme({
    components: {
        Steps: CustomSteps,
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
            <App />
        </QueryClientProvider>
    </ChakraProvider>
);
export default AppWrapper;
