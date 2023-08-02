import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import { useStore } from "effector-react";
import { useMemo } from "react";
import { $otherProcessed } from "../pages/program/Store";
import Superscript from "./Superscript";
import TableDisplay from "./TableDisplay";

export default function OtherSystemPreview() {
    const otherProcessed = useStore($otherProcessed);
    const instanceColumns = useMemo<ColumnDef<any>[]>(() => {
        if (otherProcessed.length > 0) {
            return Object.keys(otherProcessed[0]).map((col) => ({
                accessorKey: col,
                header: col,
            }));
        }
        return [];
    }, []);

    return (
        <Tabs>
            <TabList>
                <Tab>
                    <Text fontSize="18px">New Entities</Text>
                    <Superscript value={otherProcessed.length} bg="blue.500" />
                </Tab>
                <Tab>
                    <Text>Conflicts</Text>
                </Tab>
                <Tab>
                    <Text>Errors</Text>
                </Tab>
                <Tab>
                    <Text>Duplicates</Text>
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <TableDisplay<any>
                        columns={instanceColumns}
                        generatedData={otherProcessed}
                        queryKey={["others-processed", otherProcessed.length]}
                    />
                </TabPanel>
                <TabPanel>6</TabPanel>
                <TabPanel>7</TabPanel>
                <TabPanel>8</TabPanel>
            </TabPanels>
        </Tabs>
    );
}
