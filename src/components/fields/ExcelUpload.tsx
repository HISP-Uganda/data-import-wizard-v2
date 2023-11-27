import { Checkbox, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select, SingleValue } from "chakra-react-select";
import { IMapping, Option } from "data-import-wizard-utils";
import { Event } from "effector";
import { useStore } from "effector-react";
import React from "react";
import { Extraction } from "../../pages/aggregate/Interfaces";
import { dataApi } from "../../pages/program";
import { $sheets, $workbook } from "../../Store";
import { generateData } from "../../utils/utils";
import FileUpload from "../FileUpload";

export default function ExcelUpload<U extends IMapping>({
    mapping,
    children,
    updater,
    extraction,
}: {
    children?: React.ReactNode;
    mapping: Partial<U>;
    updater: Event<{ attribute: keyof U; value: any; key?: string }>;
    extraction: Extraction;
}) {
    const sheets = useStore($sheets);
    const workbook = useStore($workbook);
    const changeSheet = (e: SingleValue<Option>) => {
        updater({
            attribute: "sheet",
            value: e?.value,
        });

        if (workbook && e && e.value) {
            const actual = generateData<U>(
                mapping,
                workbook,
                e.value,
                extraction
            );
            dataApi.changeData(actual);
        }
    };

    const callback = () => {};

    return (
        <Stack spacing="30px">
            <FileUpload<U>
                type="xlsx"
                mapping={mapping}
                callback={updater}
                extraction={extraction}
            />
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
