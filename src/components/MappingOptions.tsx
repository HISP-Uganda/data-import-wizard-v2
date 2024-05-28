import { Stack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { $mapping } from "../Store";
import DHIS2AsDestinationOptions from "./import-export-options/DHIS2AsDestinationOptions";
import DHIS2AsSourceOptions from "./import-export-options/DHIS2AsSourceOptions";
import { InitialMapping } from "./InitialMapping";

export default function MappingOptions({
    showFileUpload,
}: {
    showFileUpload?: boolean;
}) {
    const mapping = useStore($mapping);
    return (
        <Stack>
            {[
                "json",
                "go-data",
                "csv-line-list",
                "xlsx-line-list",
                "xlsx-tabular-data",
                "xlsx-form",
            ].indexOf(String(mapping.dataSource)) !== -1 &&
                showFileUpload && (
                    <InitialMapping
                        isSource={mapping.isSource}
                        dataSource={mapping.dataSource}
                        extraction={
                            mapping.useColumnLetters ? "column" : undefined
                        }
                    />
                )}
            {!mapping.isSource && <DHIS2AsDestinationOptions />}
            {(mapping.isSource ||
                [
                    "dhis2-program",
                    "dhis2-program-indicators",
                    "dhis2-data-set",
                    "dhis2-indicators",
                    "dhis2-program-indicators",
                    "manual-dhis2-program-indicators",
                ].indexOf(String(mapping.dataSource)) !== -1) && (
                <DHIS2AsSourceOptions />
            )}
        </Stack>
    );
}
