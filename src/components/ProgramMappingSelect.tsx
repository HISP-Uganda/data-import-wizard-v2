import { Spinner } from "@chakra-ui/react";
import { IMapping, IProgramMapping } from "data-import-wizard-utils";
import React from "react";
import { useNamespace } from "../Queries";
import DropDown from "./DropDown";
export default function ProgramMappingSelect({
    onChange,
    value,
}: {
    onChange: (mapping: IMapping | null) => void;
    value: string | undefined;
}) {
    const { isLoading, isSuccess, error, data } =
        useNamespace<IMapping>("iw-mapping");

    if (isLoading) {
        return <Spinner />;
    }

    if (isSuccess && data) {
        return (
            <DropDown<IMapping>
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
