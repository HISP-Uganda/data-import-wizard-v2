import { Spinner } from "@chakra-ui/react";
import { IProgramMapping } from "data-import-wizard-utils";
import React from "react";
import { useNamespace } from "../Queries";
import DropDown from "./DropDown";
export default function ProgramMappingSelect({
    onChange,
    value,
}: {
    onChange: (mapping: IProgramMapping | null) => void;
    value: string | undefined;
}) {
    const { isLoading, isSuccess, error, data } =
        useNamespace<IProgramMapping>("iw-program-mapping");

    if (isLoading) {
        return <Spinner />;
    }

    if (isSuccess && data) {
        return (
            <DropDown<IProgramMapping>
                list={data}
                labelKey="name"
                valueKey="id"
                value={value}
                onChange={onChange}
            />
        );
    }
    return <pre>{JSON.stringify(error)}</pre>;
}
