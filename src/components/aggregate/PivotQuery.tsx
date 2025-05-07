import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { generateUid } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { $mapping } from "../../Store";
import { useSQLViewMetadata } from "../../Queries";
import Loader from "../Loader";
import Tables from "./Tables";

export default function PivotQuery({ program }: { program: string }) {
    const mapping = useStore($mapping);
    const { isLoading, isError, isSuccess, error, data } = useSQLViewMetadata(
        program,
        mapping.id ?? generateUid(),
    );

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: "Pivot Table",
            children: <Tables data={data} />,
        },
        {
            key: "2",
            label: "Manual Indicators",
            children: "Content of Tab Pane 2",
        },
    ];

    const onChange = (key: string) => {};

    if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;
    if (isLoading) return <Loader />;
    if (isSuccess)
        return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
    return null;
}
