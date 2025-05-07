import { Table, TableColumnsType } from "antd";
import { useStore } from "effector-react";
import { maxBy, range } from "lodash";
import { $mapping, $processed, $program } from "../../Store";

export default function ExcelExportPreview() {
    const program = useStore($program);
    const mapping = useStore($mapping);
    const processed = useStore($processed);
    const columns = mapping.dhis2SourceOptions?.columns || [];
    if (!processed.processedData || processed.processedData.length === 0) {
        return <div>No data</div>;
    }
    const stagesMax =
        program.programStages?.reduce<Record<string, number>>((a, b) => {
            const stageData = maxBy(processed.processedData, `0-${b.id}-max`);
            a[b.id] = stageData?.[`0-${b.id}-max`] ?? 1;
            return a;
        }, {}) ?? {};

    const dataColumns: TableColumnsType<Record<string, string>> = columns.map(
        (parent) => {
            const totalEvents = stagesMax[parent.column] ?? 1;
            let children: TableColumnsType<Record<string, string>> = [];
            if (parent.children.length > 0) {
                if (parent.repeatable) {
                    children = range(totalEvents).flatMap((d) => {
                        return parent.children.map((child) => ({
                            title: `#${d + 1} ${child.label}`,
                            dataIndex: `0-${parent.column}-${child.column}-${d}`,
                            key: `${child.column}-${d}`,
                        }));
                    });
                } else {
                    children = parent.children.map((child) => ({
                        title: child.label,
                        dataIndex: `0-${parent.column}-${child.column}-0`,
                        key: child.column,
                    }));
                }
            }
            return {
                title: parent.label,
                dataIndex: parent.column,
                key: parent.column,
                children,
            };
        },
    );

    return (
        <Table
            dataSource={processed.processedData}
            bordered
            scroll={{ x: "max-content" }}
            rowKey="0-trackedEntityInstance"
            style={{ whiteSpace: "nowrap" }}
            columns={dataColumns}
        />
    );
}
