import { Stack } from "@chakra-ui/react";
import { generateUid } from "data-import-wizard-utils";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useStore } from "effector-react";
import { $aggregateMapping } from "../../pages/aggregate";
import { useSQLViewMetadata } from "../../Queries";
import Loader from "../Loader";
import Tables from "./Tables";

export default function PivotQuery({ program }: { program: string }) {
    const mapping = useStore($aggregateMapping);
    const { isLoading, isError, isSuccess, error, data } = useSQLViewMetadata(
        program,
        mapping.id ?? generateUid()
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

    const onChange = (key: string) => {
        console.log(key);
    };

    if (isError) return <pre>{JSON.stringify(error, null, 2)}</pre>;
    if (isLoading) return <Loader />;
    if (isSuccess)
        return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
    return null;
}
