import { useStore } from "effector-react";
import { $programMapping } from "../pages/program/Store";
import { available } from "./DestinationIcon";

export default function SourceIcon() {
    const programMapping = useStore($programMapping);

    if (!programMapping.isSource && programMapping.dataSource) {
        return available[programMapping.dataSource];
    }

    return available["dhis2-program"];
}
