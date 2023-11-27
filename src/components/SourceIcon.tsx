import { IMapping } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { $programMapping } from "../pages/program/Store";
import { available } from "./DestinationIcon";

export default function SourceIcon({
    mapping,
}: {
    mapping: Partial<IMapping>;
}) {
    if (!mapping.isSource && mapping.dataSource) {
        return available[mapping.dataSource];
    }

    return available["dhis2-program"];
}
