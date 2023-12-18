import { ColumnsType } from "antd/es/table";
import { IMapping, Mapping, StageMapping } from "data-import-wizard-utils";
import { fromPairs, groupBy, orderBy, uniq } from "lodash";
import { uniqBy } from "lodash/fp";
import { utils, WorkBook } from "xlsx";
import dayjs from "dayjs";
import { Column, Threshold } from "../Interfaces";
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
function padZero(str: string, len: number = 2) {
    var zeros = new Array(len).join("0");
    return (zeros + str).slice(-len);
}

export const findColor = (val: number, thresholds: Threshold[]) => {
    const withoutBaseline = orderBy(
        thresholds.flatMap((val) => {
            if (val.id !== "baseline") {
                return val;
            }
            return [];
        }),
        ["value"],
        ["asc"]
    );
    const baseline =
        thresholds.find(({ id }) => id === "baseline")?.color || "";
    const search = withoutBaseline.find(({ value }, index) => {
        if (index < withoutBaseline.length - 1) {
            return val >= value && val < withoutBaseline[index + 1].value;
        }
        return val >= value;
    });
    if (search) {
        return search.color;
    }
    return baseline;
};

const calculation = {
    count: (
        data: any[],
        thresholds: Threshold[],
        others: Partial<{
            aggregationColumn: string;
            col2: string;
            prevValue: number;
        }>
    ) => {
        const value = data.length;
        const color = findColor(value, thresholds);
        return {
            bg: color,
            color: invertHex(color),
            value: value,
        };
    },
};

const findMerged = (
    list: string[],
    data: Array<any>,
    properties?: { [key: string]: any }
) => {
    if (data) {
        let finalColumns: Array<Array<Column>> = [];
        for (let index = 0; index < list.length; index++) {
            const col = list[index];
            let currentValues: Array<Column> = uniq(data.map((d) => d[col]))
                .filter((d) => !!d)
                .map((d) => {
                    return {
                        label: d,
                        value: d,
                        span: 1,
                        actual: d,
                        position: properties?.[`${d}.position`] || 1,
                        key: d,
                    };
                });
            currentValues = orderBy(currentValues, "value", "asc");
            if (index === 0) {
                finalColumns[0] = currentValues;
            } else {
                const prev = finalColumns[index - 1];
                let nextValues: Array<Column> = [];
                for (const v of prev) {
                    for (const p of currentValues) {
                        nextValues = [
                            ...nextValues,
                            {
                                label: `${v.label}${p.label}`,
                                value: `${v.value}${p.value}`,
                                key: `${v.key}--${p.value}`,
                                span: 1,
                                actual: p.value,
                                position:
                                    properties?.[`${p.value}.position`] || 1,
                            },
                        ];
                    }
                }
                nextValues = orderBy(nextValues, "value", "asc");
                finalColumns[index] = nextValues;
            }
        }

        return finalColumns.map((data, index, columns) => {
            if (index < columns.length - 1) {
                const last = columns[columns.length - 1].length;
                const current = columns[index].length;
                return data.map((x) => {
                    return { ...x, span: last / current };
                });
            }
            return data;
        });
    }
    return [];
};

export const processTable = ({
    data,
    rows,
    otherColumns,
    aggregation,
    columns,
    properties,
    dimensions,
    thresholds,
    aggregationColumn,
}: {
    data: any[];
    rows: string[];
    columns: string[];
    otherColumns: string[];
    aggregation: keyof typeof calculation;
    thresholds: Threshold[];
    aggregationColumn: string;
    dimensions?: { [key: string]: string[] };
    properties?: { [key: string]: any };
}) => {
    if (data) {
        const finalColumns = findMerged(columns, data, properties);
        const finalRows = findMerged(rows, data, properties);

        const groupedData = groupBy(data, (d) =>
            rows.map((r) => d[r]).join("")
        );

        const allKeys = Object.keys(groupedData);

        const finalData = allKeys.sort().map((key) => {
            const values = groupedData[key] || [];
            let rows = values;
            if (aggregationColumn) {
                rows = uniqBy(aggregationColumn, values);
            }
            const groupedByColumn = groupBy(values, (d) =>
                columns.map((r) => d[r]).join("")
            );
            let currentObj: any = fromPairs(
                otherColumns
                    .filter((d) => !!d)
                    .map((d) => [d, uniqBy("id", values).length])
            );

            Object.entries(groupedByColumn).forEach(
                ([columnKey, columnData]) => {
                    const calculated = calculation[aggregation](
                        columnData,
                        thresholds,
                        {
                            aggregationColumn,
                            prevValue: rows.length,
                        }
                    );
                    currentObj = {
                        ...currentObj,
                        [`${columnKey}`]: calculated.value,
                        [`${columnKey}color`]: calculated.color,
                        [`${columnKey}bg`]: calculated.bg,
                        ...columnData[0],
                        key,
                    };
                }
            );
            return currentObj;
        });
        return {
            finalColumns,
            finalRows,
            finalData,
        };
    }
    return { finalColumns: [], finalRows: [], finalData: [] };
};

export function invertHex(hex: string, bw: boolean = true) {
    if (hex) {
        if (hex.indexOf("#") === 0) {
            hex = hex.slice(1);
        }
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            return "";
        }
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            return r * 0.299 + g * 0.587 + b * 0.114 > 186
                ? "#000000"
                : "#FFFFFF";
        }
        const r1 = (255 - r).toString(16);
        const g1 = (255 - g).toString(16);
        const b1 = (255 - b).toString(16);
        return "#" + padZero(r1) + padZero(g1) + padZero(b1);
    }
    return "";
}

export function columnTree(
    list: Array<ColumnsType<any>>,
    properties: { [key: string]: any }
): Array<ColumnsType<any>> {
    if (list.length === 0) {
        return [];
    } else if (list.length === 1) {
        return [
            list[0].map((a) => {
                return {
                    ...a,
                    onHeaderCell: () => {
                        return {
                            style: {
                                backgroundColor: properties[`${a.key}.bg`],
                            },
                        };
                    },
                    onCell: (cell) => {
                        return {
                            style: {
                                backgroundColor: cell[`${a.key}bg`],
                                color: invertHex(cell[`${a.key}bg`], true),
                            },
                        };
                    },
                };
            }),
        ];
    } else if (list.length === 2) {
        return columnTree(
            [
                list[0].map((a) => {
                    return {
                        ...a,
                        children: list[1].map((b) => {
                            return {
                                ...b,
                                dataIndex: `${a.key}${b.key}`,
                                onHeaderCell: () => {
                                    return {
                                        style: {
                                            backgroundColor:
                                                properties[`${b.key}.bg`],
                                        },
                                    };
                                },
                                onCell: (cell) => {
                                    return {
                                        style: {
                                            backgroundColor: cell[`${a.key}bg`],
                                            color: invertHex(
                                                cell[`${a.key}bg`],
                                                true
                                            ),
                                        },
                                    };
                                },
                            };
                        }),
                    };
                }),
            ],
            properties
        );
    } else {
        return columnTree(
            [
                ...list.slice(0, list.length - 2),
                ...columnTree(list.slice(-2), properties),
            ],
            properties
        );
    }
}

export const saveProgramMapping = async ({
    engine,
    programMapping,
    organisationUnitMapping,
    attributeMapping,
    optionMapping,
    programStageMapping,
    action,
}: {
    engine: any;
    programMapping: Partial<IMapping>;
    organisationUnitMapping: Mapping;
    attributeMapping: Mapping;
    programStageMapping: StageMapping;
    optionMapping: Record<string, string>;
    action: "creating" | "editing";
}) => {
    const type = action === "creating" ? "create" : "update";
    const mutation: any = {
        type,
        resource: `dataStore/iw-mapping/${programMapping.id}`,
        data: {
            ...programMapping,
            lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
    };
    const mutation2: any = {
        type,
        resource: `dataStore/iw-ou-mapping/${programMapping.id}`,
        data: organisationUnitMapping,
    };
    const mutation3: any = {
        type,
        resource: `dataStore/iw-attribute-mapping/${programMapping.id}`,
        data: attributeMapping,
    };
    const mutation4: any = {
        type,
        resource: `dataStore/iw-stage-mapping/${programMapping.id}`,
        data: programStageMapping,
    };
    const mutation5: any = {
        type,
        resource: `dataStore/iw-option-mapping/${programMapping.id}`,
        data: optionMapping,
    };

    return await Promise.all([
        engine.mutate(mutation),
        engine.mutate(mutation2),
        engine.mutate(mutation3),
        engine.mutate(mutation4),
        engine.mutate(mutation5),
    ]);
};
