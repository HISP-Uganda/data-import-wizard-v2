import { DataSource } from "data-import-wizard-utils";
import APICredentials from "./APICredentials";
import CSVUpload from "./CSVUpload";
import FileUpload from "./FileUpload";
import ExcelUpload from "./mapping-fields/ExcelUpload";

export const InitialMapping = ({
    extraction,
    isSource,
    dataSource,
}: Partial<{
    isSource: boolean;
    extraction: "cell" | "column" | "json";
    dataSource: DataSource;
}>) => {
    const options = {
        api: <APICredentials accessor="authentication" displayDHIS2Options />,
        "xlsx-line-list": isSource ? null : (
            <ExcelUpload extraction={extraction ? extraction : "json"} />
        ),
        "csv-line-list": isSource ? null : <CSVUpload />,
        "xlsx-tabular-data": isSource ? null : (
            <ExcelUpload extraction={extraction ? extraction : "json"} />
        ),
        "xlsx-form": isSource ? null : <ExcelUpload extraction="cell" />,
        csv: isSource ? null : <CSVUpload />,
        json: isSource ? null : <FileUpload type="json" extraction="json" />,
        "dhis2-data-set": (
            <APICredentials accessor="authentication" displayDHIS2Options />
        ),
        "dhis2-indicators": (
            <APICredentials accessor="authentication" displayDHIS2Options />
        ),
        "dhis2-program-indicators": (
            <APICredentials accessor="authentication" displayDHIS2Options />
        ),
        "manual-dhis2-program-indicators": (
            <APICredentials accessor="authentication" displayDHIS2Options />
        ),
        "dhis2-program": (
            <APICredentials accessor="authentication" displayDHIS2Options />
        ),
        "go-data": (
            <APICredentials accessor="authentication" displayDHIS2Options />
        ),
    };

    if (dataSource) {
        return options[dataSource];
    }
    return null;
};
