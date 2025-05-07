import { Box, Input, Stack, Text } from "@chakra-ui/react";
import { GroupBase, Select, SingleValue } from "chakra-react-select";
import { Extraction, IMapping, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import React, { ChangeEvent, useEffect } from "react";
import { dataApi, mappingApi } from "../../Events";
import { $mapping, $sheets, $workbook } from "../../Store";
import { generateData } from "../../utils/utils";
import FileUpload from "../FileUpload";

export default function ExcelUpload({
    children,
    extraction,
}: {
    children?: React.ReactElement;
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
    };

    const changeAttribute = (
        e: ChangeEvent<HTMLInputElement>,
        attribute: keyof IMapping,
    ) => {
        if (e.target.value) {
            mappingApi.update({
                attribute,
                value: Number(e.target.value),
            });
            if (attribute === "headerRow") {
                mappingApi.update({
                    attribute: "dataStartRow",
                    value: Number(e.target.value) + 1,
                });
            }
        } else {
            mappingApi.update({
                attribute,
                value: "",
            });
        }
    };

    useEffect(() => {
        if (workbook) {
            const actual = generateData(mapping, workbook, extraction);
            dataApi.changeData(actual);
        }
    }, [mapping.headerRow, mapping.dataStartRow, mapping.sheet]);

    if (mapping.isSource) return null;
    return (
        <Stack spacing="30px">
            <FileUpload
                type="xlsx"
                extraction={extraction}
                onDataChange={dataApi.changeData}
                fileUploadLabel="Upload Excel file"
            />
            <Stack direction="row" alignItems="center" flex={1} spacing="20px">
                <Stack
                    direction="row"
                    alignItems="center"
                    flex={1}
                    spacing="20px"
                >
                    <Text>Select Sheet</Text>
                    <Box flex={1}>
                        <Select<Option, false, GroupBase<Option>>
                            value={sheets.find(
                                (pt) => pt.value === mapping.sheet,
                            )}
                            onChange={(e) => changeSheet(e)}
                            options={sheets}
                            isClearable
                            menuPlacement="auto"
                        />
                    </Box>
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    flex={1}
                    spacing="20px"
                >
                    <Text>Header Row</Text>
                    <Input
                        flex={1}
                        value={mapping.headerRow || ""}
                        onChange={(e) => changeAttribute(e, "headerRow")}
                    />
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    flex={1}
                    spacing="20px"
                >
                    <Text>Data Start Row</Text>
                    <Input
                        flex={1}
                        value={mapping.dataStartRow || ""}
                        onChange={(e) => changeAttribute(e, "dataStartRow")}
                    />
                </Stack>
            </Stack>
            {children}
        </Stack>
    );
}
