import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import Table, { ColumnsType } from "antd/es/table";
import { GoResponse } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import {
    $mandatoryAttribute,
    $processedGoDataData,
} from "../pages/program/Store";
import Superscript from "./Superscript";

export default function GoDataPreview() {
    const { processed, conflicts, errors } = useStore($processedGoDataData);
    const [columns, setColumns] = useState<{
        person: ColumnsType<any>;
        epidemiology: ColumnsType<any>;
        events: ColumnsType<any>;
        relationships: ColumnsType<any>;
        lab: ColumnsType<any>;
        questionnaire: ColumnsType<any>;
    }>({
        person: [],
        epidemiology: [],
        events: [],
        relationships: [],
        lab: [],
        questionnaire: [],
    });
    const [updateColumns, setUpdateColumns] = useState<{
        person: ColumnsType<any>;
        epidemiology: ColumnsType<any>;
        events: ColumnsType<any>;
        relationships: ColumnsType<any>;
        lab: ColumnsType<any>;
        questionnaire: ColumnsType<any>;
    }>({
        person: [],
        epidemiology: [],
        events: [],
        relationships: [],
        lab: [],
        questionnaire: [],
    });
    const [errorColumns, setErrorColumns] = useState<{
        person: ColumnsType<any>;
        epidemiology: ColumnsType<any>;
        events: ColumnsType<any>;
        relationships: ColumnsType<any>;
        lab: ColumnsType<any>;
        questionnaire: ColumnsType<any>;
    }>({
        person: [],
        epidemiology: [],
        events: [],
        relationships: [],
        lab: [],
        questionnaire: [],
    });
    const [conflictColumns, setConflictColumns] = useState<{
        person: ColumnsType<any>;
        epidemiology: ColumnsType<any>;
        events: ColumnsType<any>;
        relationships: ColumnsType<any>;
        lab: ColumnsType<any>;
        questionnaire: ColumnsType<any>;
    }>({
        person: [],
        epidemiology: [],
        events: [],
        relationships: [],
        lab: [],
        questionnaire: [],
    });

    const mandatoryAttributes = useStore($mandatoryAttribute);
    useEffect(() => {
        if (processed && processed.inserts) {
            setColumns((prev) => ({
                ...prev,
                person: Object.keys(processed.inserts.person?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                lab: Object.keys(processed.inserts.lab?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                epidemiology: Object.keys(
                    processed.inserts.epidemiology?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                events: Object.keys(processed.inserts.events?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                questionnaire: Object.keys(
                    processed.inserts.questionnaire?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                relationships: Object.keys(
                    processed.inserts.relationships?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
            }));
        }
        return () => {};
    }, [JSON.stringify(processed?.inserts)]);

    useEffect(() => {
        if (processed && processed.updates) {
            setUpdateColumns((prev) => ({
                ...prev,
                person: Object.keys(processed.updates.person?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                lab: Object.keys(processed.updates.lab?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                epidemiology: Object.keys(
                    processed.updates.epidemiology?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                events: Object.keys(processed.updates.events?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                questionnaire: Object.keys(
                    processed.updates.questionnaire?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                relationships: Object.keys(
                    processed.updates.relationships?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
            }));
        }
        return () => {};
    }, [JSON.stringify(processed?.updates)]);

    useEffect(() => {
        if (errors) {
            setErrorColumns((prev) => ({
                ...prev,
                person: Object.keys(errors.person?.[0] || []).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                lab: Object.keys(errors.lab?.[0] || []).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                epidemiology: Object.keys(errors.epidemiology?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                events: Object.keys(errors.events?.[0] || []).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                questionnaire: Object.keys(errors.questionnaire?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
                relationships: Object.keys(errors.relationships?.[0] || []).map(
                    (col) => ({
                        title: col,
                        dataIndex: col,
                        key: col,
                    })
                ),
            }));
        }
        return () => {};
    }, [JSON.stringify(errors)]);

    useEffect(() => {
        if (conflicts) {
            setConflictColumns((prev) => ({
                ...prev,
                person: Object.keys(conflicts.person?.[0] || []).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                lab: Object.keys(conflicts.lab?.[0] || []).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                epidemiology: Object.keys(
                    conflicts.epidemiology?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                events: Object.keys(conflicts.events?.[0] || []).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                questionnaire: Object.keys(
                    conflicts.questionnaire?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
                relationships: Object.keys(
                    conflicts.relationships?.[0] || []
                ).map((col) => ({
                    title: col,
                    dataIndex: col,
                    key: col,
                })),
            }));
        }
        return () => {};
    }, [JSON.stringify(conflicts)]);

    const innerTabs = (
        data: GoResponse | undefined,
        realColumns: {
            person: ColumnsType<any>;
            epidemiology: ColumnsType<any>;
            events: ColumnsType<any>;
            relationships: ColumnsType<any>;
            lab: ColumnsType<any>;
            questionnaire: ColumnsType<any>;
        },
        idField: string = mandatoryAttributes.join("")
    ) => (
        <Tabs>
            <TabList>
                <Tab>
                    <Text>Person</Text>
                    <Superscript
                        value={data?.person?.length || 0}
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Epidemiology</Text>
                    <Superscript
                        value={data?.epidemiology?.length || 0}
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Events</Text>
                    <Superscript
                        value={data?.events?.length || 0}
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Questionnaire</Text>
                    <Superscript
                        value={data?.questionnaire?.length || 0}
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Lab</Text>
                    <Superscript
                        value={data?.lab?.length || 0}
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Relationships</Text>
                    <Superscript
                        value={data?.relationships?.length || 0}
                        bg="green.500"
                    />
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Table
                        columns={realColumns.person}
                        dataSource={data?.person || []}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.epidemiology}
                        dataSource={data?.epidemiology || []}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.events}
                        dataSource={data?.events || []}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.questionnaire}
                        dataSource={data?.questionnaire || []}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.lab}
                        dataSource={data?.lab || []}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.relationships}
                        dataSource={data?.relationships || []}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
    return (
        <Tabs>
            <TabList>
                <Tab>
                    <Text fontSize="18px">New Inserts</Text>
                    <Superscript
                        value={
                            (processed?.inserts.person?.length || 0) +
                            (processed?.inserts.epidemiology?.length || 0) +
                            (processed?.inserts.events?.length || 0) +
                            (processed?.inserts.lab?.length || 0) +
                            (processed?.inserts.questionnaire?.length || 0) +
                            (processed?.inserts.relationships?.length || 0)
                        }
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text fontSize="18px">Updates</Text>
                    <Superscript
                        value={
                            (processed?.updates.person?.length || 0) +
                            (processed?.updates.epidemiology?.length || 0) +
                            (processed?.updates.events?.length || 0) +
                            (processed?.updates.lab?.length || 0) +
                            (processed?.updates.questionnaire?.length || 0) +
                            (processed?.updates.relationships?.length || 0)
                        }
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Conflicts</Text>
                    <Superscript
                        value={
                            (conflicts?.person?.length || 0) +
                            (conflicts?.epidemiology?.length || 0) +
                            (conflicts?.events?.length || 0) +
                            (conflicts?.lab?.length || 0) +
                            (conflicts?.questionnaire?.length || 0) +
                            (conflicts?.relationships?.length || 0)
                        }
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Errors</Text>
                    <Superscript
                        value={
                            (errors?.person?.length || 0) +
                            (errors?.epidemiology?.length || 0) +
                            (errors?.events?.length || 0) +
                            (errors?.lab?.length || 0) +
                            (errors?.questionnaire?.length || 0) +
                            (errors?.relationships?.length || 0)
                        }
                        bg="red.500"
                    />
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>{innerTabs(processed?.inserts, columns)}</TabPanel>
                <TabPanel>
                    {innerTabs(processed?.updates, updateColumns)}
                </TabPanel>
                <TabPanel>
                    {innerTabs(conflicts, conflictColumns, "id")}
                </TabPanel>
                <TabPanel>{innerTabs(errors, errorColumns, "id")}</TabPanel>
            </TabPanels>
        </Tabs>
    );
}
