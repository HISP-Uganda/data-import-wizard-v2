/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ColumnInfo,
    ExcelColumnOptions,
    ExcelHeader,
    GenerateExcelOptions,
    StyleRule,
} from "data-import-wizard-utils";
import { Worksheet as ExcelJSWorksheet, Workbook } from "exceljs";

import { convertToExcelStyle, DEFAULT_HEADER_STYLE } from "./utils/utils";

interface ExtendedWorksheet extends ExcelJSWorksheet {
    styleRules?: StyleRule[];
}

export class ExcelGenerator {
    private workbook: Workbook;
    private worksheet: ExtendedWorksheet | null;

    constructor() {
        this.workbook = new Workbook();
        this.worksheet = null;
    }

    private getMaxHeaderDepth(
        headers: ExcelHeader[],
        currentDepth: number = 1,
    ): number {
        let maxDepth = currentDepth;
        headers.forEach((header) => {
            if (header.children && header.children.length > 0) {
                const childDepth = this.getMaxHeaderDepth(
                    header.children,
                    currentDepth + 1,
                );
                maxDepth = Math.max(maxDepth, childDepth);
            }
        });
        return maxDepth;
    }

    private calculateSpan(children: ExcelHeader[]): number {
        return children.reduce((total, child) => {
            if (child.children) {
                return total + this.calculateSpan(child.children);
            }
            return total + (child.span || 1);
        }, 0);
    }

    private createHeaderStructure(headers: ExcelHeader[]): ColumnInfo {
        const columnInfo: ColumnInfo = {
            totalColumns: 0,
            merges: [],
            columns: [],
            maxDepth: this.getMaxHeaderDepth(headers),
        };

        const currentColumn = 1;
        this.processHeaders(headers, 1, currentColumn, columnInfo);

        return columnInfo;
    }

    private processHeaders(
        headers: ExcelHeader[],
        row: number,
        startCol: number,
        columnInfo: ColumnInfo,
        level: number = 1,
    ): void {
        let currentCol = startCol;

        headers.forEach((header) => {
            const hasChildren = header.children && header.children.length > 0;
            const span = hasChildren
                ? this.calculateSpan(header.children!)
                : header.span || 1;

            if (this.worksheet) {
                const cell = this.worksheet.getCell(row, currentCol);
                cell.value = header.title;

                if (header.customStyle) {
                    const excelStyle = convertToExcelStyle(header.customStyle);
                    if (excelStyle) {
                        Object.assign(cell, excelStyle);
                    }
                }
                if (header.style) {
                    Object.assign(cell, header.style);
                }
            }

            if (hasChildren) {
                columnInfo.merges.push({
                    start: { row, col: currentCol },
                    end: { row, col: currentCol + span - 1 },
                });

                this.processHeaders(
                    header.children!,
                    row + 1,
                    currentCol,
                    columnInfo,
                    level + 1,
                );
            } else {
                if (level < columnInfo.maxDepth) {
                    columnInfo.merges.push({
                        start: { row, col: currentCol },
                        end: { row: columnInfo.maxDepth, col: currentCol },
                    });
                }

                columnInfo.columns.push({
                    key: header.key || `col${currentCol}`,
                    width: header.width || 15,
                    customStyle: header.customStyle,
                    style: header.style,
                    conditionalFormats: header.conditionalFormats,
                    autoWidth: header.autoWidth,
                });
            }
            columnInfo.totalColumns = Math.max(
                columnInfo.totalColumns,
                currentCol + span - 1,
            );
            currentCol += span;
        });
    }

    private applyDefaultHeaderStyle(
        totalColumns: number,
        maxDepth: number,
    ): void {
        if (!this.worksheet) return;

        for (let row = 1; row <= maxDepth; row++) {
            for (let col = 1; col <= totalColumns; col++) {
                const cell = this.worksheet.getCell(row, col);
                if (!cell.style || Object.keys(cell.style).length === 0) {
                    Object.assign(
                        cell,
                        convertToExcelStyle(DEFAULT_HEADER_STYLE),
                    );
                }
            }
        }
    }

    private applyConditionalFormatting(
        column: ExcelColumnOptions,
        startRow: number,
        colIndex: number,
    ): void {
        if (!this.worksheet || !column.conditionalFormats) return;

        const endRow = this.worksheet.rowCount;
        const colLetter = this.worksheet.getColumn(colIndex + 1).letter;
        const range = `${colLetter}${startRow}:${colLetter}${endRow}`;

        console.log(range);

        column.conditionalFormats.forEach((cf) => {
            console.log(cf);

            if (cf.type === "cellIs") {
                if (
                    cf.operator === "between" &&
                    cf.minValue !== undefined &&
                    cf.maxValue !== undefined
                ) {
                    this.worksheet!.addConditionalFormatting({
                        ref: range,
                        rules: [
                            {
                                type: "expression",
                                priority: 1,
                                formulae: [
                                    `AND(${colLetter}${startRow}>=${cf.minValue},${colLetter}${endRow}<=${cf.maxValue})`,
                                ],
                                style: {
                                    fill: {
                                        type: "pattern",
                                        pattern: "solid",
                                        bgColor: {
                                            argb:
                                                cf.customStyle?.fill?.fgColor
                                                    ?.argb || "FFFFFF00",
                                        },
                                    },
                                },
                            },
                        ],
                    });
                } else if (cf.operator && cf.value !== undefined) {
                    let operator: string;
                    switch (cf.operator) {
                        case "greaterThan":
                            operator = ">";
                            break;
                        case "lessThan":
                            operator = "<";
                            break;
                        case "equal":
                            operator = "=";
                            break;
                        case "greaterThanOrEqual":
                            operator = ">=";
                            break;
                        case "lessThanOrEqual":
                            operator = "<=";
                            break;
                        default:
                            operator = "=";
                    }

                    this.worksheet!.addConditionalFormatting({
                        ref: range,
                        rules: [
                            {
                                type: "expression",
                                priority: 1,
                                formulae: [
                                    `${colLetter}1${operator}${cf.value}`,
                                ],
                                style: {
                                    fill: {
                                        type: "pattern",
                                        pattern: "solid",
                                        bgColor: {
                                            argb:
                                                cf.customStyle?.fill?.fgColor
                                                    ?.argb || "FFFF0000",
                                        },
                                    },
                                },
                            },
                        ],
                    });
                }
            }
        });
    }

    private autoFitColumns(): void {
        if (!this.worksheet) return;

        this.worksheet.columns.forEach((column: any, index) => {
            if (column.autoWidth) {
                let maxLength = 0;
                const columnLetter = this.worksheet!.getColumn(
                    index + 1,
                ).letter;

                const headerCell = this.worksheet!.getCell(`${columnLetter}1`);
                maxLength = Math.max(
                    maxLength,
                    String(headerCell.value || "").length,
                );

                this.worksheet!.getColumn(index + 1).eachCell(
                    { includeEmpty: false },
                    (cell) => {
                        const cellLength = String(cell.value || "").length;
                        maxLength = Math.max(maxLength, cellLength);
                    },
                );

                column.width = maxLength + 2;
            }
        });
    }

    public async generateExcel<T extends Record<string, any>>(
        headers: ExcelHeader[],
        data: T[],
        options: GenerateExcelOptions = {},
    ): Promise<Blob> {
        const {
            sheetName = "Export",
            styleRules,
            autoFitColumns = true,
        } = options;

        this.worksheet = this.workbook.addWorksheet(
            sheetName,
        ) as ExtendedWorksheet;
        this.worksheet.styleRules = styleRules;

        const columnInfo = this.createHeaderStructure(headers);

        columnInfo.merges.forEach((merge) => {
            this.worksheet?.mergeCells(
                merge.start.row,
                merge.start.col,
                merge.end.row,
                merge.end.col,
            );
        });

        if (data && data.length > 0) {
            const dataStartRow = columnInfo.maxDepth + 1;

            data.forEach((row, rowIndex) => {
                const currentRow = dataStartRow + rowIndex;
                columnInfo.columns.forEach((col, colIndex) => {
                    if (this.worksheet) {
                        const cell = this.worksheet.getCell(
                            currentRow,
                            colIndex + 1,
                        );
                        cell.value = row[col.key];
                    }
                });
            });

            columnInfo.columns.forEach((column, index) => {
                if (column.conditionalFormats) {
                    this.applyConditionalFormatting(
                        column,
                        dataStartRow,
                        index,
                    );
                }
            });
        }

        this.applyDefaultHeaderStyle(
            columnInfo.totalColumns,
            columnInfo.maxDepth,
        );

        if (autoFitColumns) {
            this.autoFitColumns();
        }

        const buffer = await this.workbook.xlsx.writeBuffer();
        return new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
    }

    public async downloadExcel<T extends Record<string, any>>(
        headers: ExcelHeader[],
        data: T[],
        filename: string,
        options: {
            sheetName?: string;
            styleRules?: StyleRule[];
        } = {},
    ): Promise<void> {
        const blob = await this.generateExcel(headers, data, options);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}
