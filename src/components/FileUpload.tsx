import { Stack } from "@chakra-ui/react";
import { IMapping, Extraction, MappingEvent } from "data-import-wizard-utils";
import { Event } from "effector";
import { useStore } from "effector-react";
import { ChangeEvent, useRef, useState } from "react";
import { read, utils } from "xlsx";
import { dataApi, mappingApi } from "../Events";
import { $mapping, workbookApi } from "../Store";
import { generateData } from "../utils/utils";

export default function FileUpload({
    type,
    callback,
    extraction,
}: {
    type: string;
    extraction: Extraction;
    callback?: Event<MappingEvent>;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hasFile, setHasFile] = useState<boolean>(false);
    const mapping = useStore($mapping);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            let fileReader = new FileReader();
            const file = e.target.files[0];
            setHasFile(() => true);
            fileReader.onload = async (e) => {
                const result = e.target?.result;
                if (result && type === "json") {
                    dataApi.changeData(JSON.parse(String(result)));
                } else {
                    const workbook = read(e.target?.result, {
                        type: "array",
                        raw: true,
                    });
                    workbookApi.set(workbook);
                    mappingApi.update({
                        attribute: "sheet",
                        value: workbook.SheetNames[0],
                    });

                    const actual = generateData(
                        mapping,
                        workbook,
                        workbook.SheetNames[0],
                        extraction
                    );

                    dataApi.changeData(actual);
                }
            };
            type === "json"
                ? fileReader.readAsText(file)
                : fileReader.readAsArrayBuffer(file);
        }
    };

    const resetFileInput = () => {
        if (inputRef && inputRef.current) {
            inputRef.current.value = "";
            setHasFile(() => false);
        }
    };
    return (
        <Stack direction="row" alignItems="center">
            <input
                ref={inputRef}
                type="file"
                id="input"
                multiple
                onChange={handleFileChange}
            />
            {hasFile && (
                <button onClick={resetFileInput}>Reset file input</button>
            )}
        </Stack>
    );
}
