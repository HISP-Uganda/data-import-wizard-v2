import { IMapping } from "data-import-wizard-utils";
import { available } from "./DestinationIcon";

export default function SourceIcon({
    mapping,
}: {
    mapping: Partial<IMapping>;
}) {
    if (mapping && !mapping.isSource && mapping.dataSource) {
        return available[mapping.dataSource];
    }

    return available["dhis2-program"];
}
