import { Stack } from "@chakra-ui/react";
import { IMapping } from "data-import-wizard-utils";
import { Event } from "effector";
import { ChangeEvent, useRef, useState } from "react";
import { read, utils } from "xlsx";
import { Extraction } from "../pages/aggregate/Interfaces";
import { dataApi } from "../pages/program";
import { workbookApi } from "../Store";
import { generateData } from "../utils/utils";

export default function FileUpload<U extends IMapping>({
    type,
    callback,
    mapping,
    extraction,
}: {
    type: string;
    extraction: Extraction;
    mapping: Partial<U>;
    callback?: Event<{ attribute: keyof U; value: any; key?: string }>;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hasFile, setHasFile] = useState<boolean>(false);

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
                    if (callback) {
                        callback({
                            attribute: "sheet",
                            value: workbook.SheetNames[0],
                        });

                        const actual = generateData<U>(
                            mapping,
                            workbook,
                            workbook.SheetNames[0],
                            extraction
                        );

                        dataApi.changeData(actual);
                    }
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
