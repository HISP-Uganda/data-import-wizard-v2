import { Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select, SingleValue } from "chakra-react-select";
import { Extraction, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import React from "react";
import { dataApi, mappingApi } from "../../Events";
import { $mapping, $sheets, $workbook } from "../../Store";
import { generateData } from "../../utils/utils";
import FileUpload from "../FileUpload";

export default function ExcelUpload({
    children,
    extraction,
}: {
    children?: React.ReactNode;
    extraction: Extraction;
}) {
    const sheets = useStore($sheets);
    const workbook = useStore($workbook);
    const mapping = useStore($mapping);
    const changeSheet = (e: SingleValue<Option>) => {
        mappingApi.update({
            attribute: "sheet",
            value: e?.value,
        });

        if (workbook && e && e.value) {
            const actual = generateData(mapping, workbook, e.value, extraction);
            dataApi.changeData(actual);
        }
    };

    const callback = () => {};

    return (
        <Stack spacing="30px">
            <FileUpload type="xlsx" extraction={extraction} />
            <Stack>
                <Text>Excel sheet</Text>
                <Select<Option, false, GroupBase<Option>>
                    value={sheets.find((pt) => pt.value === mapping.sheet)}
                    onChange={(e) => changeSheet(e)}
                    options={sheets}
                    isClearable
                    menuPlacement="auto"
                    size="sm"
                />
            </Stack>
            {children}
        </Stack>
    );
}
