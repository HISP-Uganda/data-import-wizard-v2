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
import { useEffect, useState } from "react";
import { $conflicts, $errors, $mandatoryAttribute } from "../../Store";
import Superscript from "../Superscript";
import TableDisplay from "../TableDisplay";

export default function OtherSystemPreview() {
    const errors = useStore($errors);
    const conflicts = useStore($conflicts);
    const [columns, setColumns] = useState<ColumnDef<any>[]>([]);
    const [errorColumns, setErrorColumns] = useState<ColumnDef<any>[]>([]);
    const [conflictColumns, setConflictColumns] = useState<ColumnDef<any>[]>(
        [],
    );
    const mandatoryAttributes = useStore($mandatoryAttribute);

    useEffect(() => {
        if (errors.length > 0) {
            setErrorColumns(() =>
                Object.keys(errors[0]).map((col) => ({
                    accessorKey: col,
                    header: col,
                })),
            );
        }
        return () => {};
    }, [JSON.stringify(errors)]);

    useEffect(() => {
        if (conflicts.length > 0) {
            setConflictColumns(() =>
                Object.keys(conflicts[0]).map((col) => ({
                    accessorKey: col,
                    header: col,
                })),
            );
        }
        return () => {};
    }, [JSON.stringify(conflicts)]);

    return (
        <Tabs>
            <TabList>
                <Tab>
                    <Text fontSize="18px">New Inserts</Text>
                    <Superscript value={0} bg="green.500" />
                </Tab>
                <Tab>
                    <Text fontSize="18px">Updates</Text>
                    <Superscript value={0} bg="green.500" />
                </Tab>
                <Tab>
                    <Text>Conflicts</Text>
                    <Superscript value={conflicts.length} bg="blue.500" />
                </Tab>
                <Tab>
                    <Text>Errors</Text>
                    <Superscript value={errors.length} bg="red.500" />
                </Tab>
                <Tab>
                    <Text>Duplicates</Text>
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <TableDisplay<any>
                        columns={columns}
                        generatedData={[]}
                        queryKey={["processed", JSON.stringify([])]}
                        idField={mandatoryAttributes[0]}
                    />
                </TabPanel>
                <TabPanel>
                    <TableDisplay<any>
                        columns={columns}
                        generatedData={[]}
                        queryKey={["updates", JSON.stringify([])]}
                        idField={mandatoryAttributes[0]}
                    />
                </TabPanel>
                <TabPanel>
                    <TableDisplay<any>
                        columns={conflictColumns}
                        generatedData={conflicts}
                        queryKey={["conflicts", JSON.stringify(conflicts)]}
                        idField={mandatoryAttributes[0]}
                    />
                </TabPanel>
                <TabPanel>
                    <TableDisplay<any>
                        columns={errorColumns}
                        generatedData={errors}
                        queryKey={["errors", JSON.stringify(errors)]}
                        idField={mandatoryAttributes[0]}
                    />
                </TabPanel>
                <TabPanel>8</TabPanel>
            </TabPanels>
        </Tabs>
    );
}
