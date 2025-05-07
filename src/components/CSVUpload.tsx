import { Button, Stack } from "@chakra-ui/react";
import { fromPairs } from "lodash";
import React, { CSSProperties } from "react";
import { useCSVReader } from "react-papaparse";
import { dataApi } from "../Events";

const styles = {
    csvReader: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10,
    } as CSSProperties,
    browseFile: {
        width: "20%",
    } as CSSProperties,
    acceptedFile: {
        border: "1px solid #ccc",
        height: 45,
        lineHeight: 2.5,
        paddingLeft: 10,
        width: "80%",
    } as CSSProperties,
    remove: {
        borderRadius: 0,
        padding: "0 20px",
    } as CSSProperties,
    progressBarBackgroundColor: {
        backgroundColor: "red",
    } as CSSProperties,
};

export default function CSVUpload() {
    const { CSVReader } = useCSVReader();

    return (
        <CSVReader
            onUploadAccepted={({ data }: { data: string[][] }) => {
                const [first, ...rest] = data;
                dataApi.changeData(
                    rest.map((r) =>
                        fromPairs(r.map((v, index) => [first[index], v]))
                    )
                );
            }}
        >
            {({
                getRootProps,
                acceptedFile,
                ProgressBar,
                getRemoveFileProps,
            }: any) => (
                <Stack>
                    <Stack direction="row" alignItems="center">
                        <Button type="button" {...getRootProps()} size="sm">
                            Browse file
                        </Button>
                        <div>{acceptedFile && acceptedFile.name}</div>
                        <Button
                            {...getRemoveFileProps()}
                            style={styles.remove}
                            size="sm"
                        >
                            Remove
                        </Button>
                    </Stack>
                    <ProgressBar style={styles.progressBarBackgroundColor} />
                </Stack>
            )}
        </CSVReader>
    );
}
