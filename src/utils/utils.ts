import { IMapping } from "data-import-wizard-utils";
import { fromPairs, uniq } from "lodash";
import { utils, WorkBook } from "xlsx";
import { Extraction } from "../pages/aggregate/Interfaces";

export function encodeToBinary(str: string): string {
    return btoa(
        encodeURIComponent(str).replace(
            /%([0-9A-F]{2})/g,
            function (match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            }
        )
    );
}
export function decodeFromBinary(str: string): string {
    return decodeURIComponent(
        Array.prototype.map
            .call(atob(str), function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
    );
}

export const convertDataToURL = (objs: any[]) => {
    return objs
        .map((s) => {
            return s.param + "=" + s.value;
        })
        .join("&");
};

export const generateData = <U extends IMapping>(
    mapping: Partial<U>,
    workbook: WorkBook,
    sheet: string,
    extraction: Extraction
) => {
    const sheetData = workbook.Sheets[sheet];
    if (extraction === "json") {
        if (mapping.headerRow === 1 && mapping.dataStartRow === 2) {
            const data = utils.sheet_to_json(sheetData, {
                raw: true,
                defval: "",
            });
            return data;
        } else if (mapping.headerRow && mapping.dataStartRow) {
            const data: string[][] = utils.sheet_to_json(sheetData, {
                header: 1,
                defval: "",
            });
            const header = data[mapping.headerRow - 1];
            return data
                .slice(mapping.dataStartRow)
                .map((d) =>
                    fromPairs(d.map((dx, index) => [header[index], dx]))
                );
        }
        return [];
    } else if (extraction === "column") {
        const data = utils.sheet_to_json(sheetData, {
            raw: true,
            defval: "",
            header: "A",
        });
        return data;
    } else if (extraction === "cell") {
        const {
            ["!cols"]: cols,
            ["!rows"]: rows,
            ["!merges"]: merges,
            ["!protect"]: protect,
            ["!autofilter"]: autofilter,
            ["!ref"]: ref,
            ["!margins"]: margins,
            ["!type"]: type,
            ...rest
        } = sheetData;
        return [rest];
    }
    return [];
};
