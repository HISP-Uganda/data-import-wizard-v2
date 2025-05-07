import { Stack, Text } from "@chakra-ui/react";
import { DataSource } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { Select } from "antd";
import { dataApi, fhirApi } from "../Events";
import { $conceptColumns, $fhir } from "../Store";
import APICredentials from "./APICredentials";
import FileUpload from "./FileUpload";
import ExcelUpload from "./mapping-fields/ExcelUpload";

export const InitialMapping = ({
    extraction,
    dataSource,
}: Partial<{
    extraction: "cell" | "column" | "json";
    dataSource: DataSource;
}>) => {
    const conceptColumns = useStore($conceptColumns);
    const fhir = useStore($fhir);
    const options: Record<DataSource, React.ReactElement> = {
        api: <APICredentials accessor="authentication" displayDHIS2Options />,
        "xlsx-line-list": (
            <ExcelUpload extraction={extraction ? extraction : "json"} />
        ),
        "csv-line-list": (
            <ExcelUpload extraction={extraction ? extraction : "json"} />
        ),
        "xlsx-tabular-data": (
            <ExcelUpload extraction={extraction ? extraction : "json"} />
        ),
        "xlsx-form": <ExcelUpload extraction="cell" />,

        json: (
            <FileUpload
                type="json"
                extraction="json"
                onDataChange={dataApi.changeData}
				fileUploadLabel="JSON File"
            />
        ),
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
        fhir: (
            <Stack>
                <FileUpload
                    type="excel"
                    extraction="json"
                    onDataChange={fhirApi.setConcepts}
					fileUploadLabel="FHIR Concepts File"
                />

                <Stack>
                    <Text>Label Field</Text>
                    <Select
                        options={conceptColumns.map((c) => ({
                            value: c,
                            label: c,
                        }))}
                        value={fhir.labelColumn}
                        showSearch
                        allowClear
                        filterOption={(input, option) =>
                            (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase()) ||
                            (option?.value ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        onChange={(e) => fhirApi.changeLabelColumn(e)}
                    />
                </Stack>
                <Stack>
                    <Text>Value Field</Text>
                    <Select
                        options={conceptColumns.map((c) => ({
                            value: c,
                            label: c,
                        }))}
                        value={fhir.valueColumn}
                        showSearch
                        allowClear
                        filterOption={(input, option) =>
                            (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase()) ||
                            (option?.value ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        onChange={(e) => fhirApi.changeValueColumn(e)}
                    />
                </Stack>
            </Stack>
        ),
    };

    if (dataSource) {
        return options[dataSource];
    }
    return null;
};
