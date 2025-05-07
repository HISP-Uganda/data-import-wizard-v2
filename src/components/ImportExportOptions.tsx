import { Stack, Text } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { CQIDexie } from "../db";
import { $mapping } from "../Store";
import DHIS2AsDestinationOptions from "./import-export-options/DHIS2AsDestinationOptions";
import DHIS2AsSourceOptions from "./import-export-options/DHIS2AsSourceOptions";
import { InitialMapping } from "./InitialMapping";

export default function ImportExportOptions({
    showFileUpload,
    db,
}: {
    showFileUpload?: boolean;
    db: CQIDexie;
}) {
    const mapping = useStore($mapping);
    return (
        <Stack spacing="30px">
            {showFileUpload &&
                [
                    "json",
                    "go-data",
                    "csv-line-list",
                    "xlsx-line-list",
                    "xlsx-tabular-data",
                    "xlsx-form",
                    "fhir",
                ].indexOf(String(mapping.dataSource)) !== -1 && (
                    <InitialMapping
                        dataSource={mapping.dataSource}
                        extraction={
                            mapping.useColumnLetters ? "column" : undefined
                        }
                    />
                )}
            {!mapping.isSource && <DHIS2AsDestinationOptions />}
            {([
                "dhis2-program",
                "dhis2-data-set",
                "dhis2-indicators",
                "dhis2-program-indicators",
                "manual-dhis2-program-indicators",
            ].indexOf(mapping.dataSource ?? "") !== -1 ||
                mapping.isSource) && <DHIS2AsSourceOptions db={db} />}
        </Stack>
    );
}
