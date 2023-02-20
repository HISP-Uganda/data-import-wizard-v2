import {
    Text,
    Box
} from "@chakra-ui/react";
// import Wizard from "./Wizard";
import OurStepper from "../OurStepper";
// import Stepper from "./StepsExample";

const Aggregate = () => {
    return (
        <>
            <Box p={4}>
                <Text>Aggregate</Text>
                <OurStepper/>
            </Box>
        </>
    );
};

export default Aggregate;