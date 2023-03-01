import React from "react";
import { Stack } from "@chakra-ui/react";
import { InputField, Table } from "@dhis2/ui";

import { useStore } from "effector-react";
import { $iStore } from "../../stores/Store";
const Step1 = () => {
    const store = useStore($iStore);
    return <Stack></Stack>;
};

export default Step1;
