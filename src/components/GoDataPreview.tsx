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
import { isArray, isObject, uniq } from "lodash";
import { getOr } from "lodash/fp";
import { useEffect, useState } from "react";
import { $mandatoryAttribute, $processedGoDataData } from "../Store";
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
                person: uniq(
                    processed.inserts.person.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                lab: uniq(
                    processed.inserts.lab.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                epidemiology: uniq(
                    processed.inserts.epidemiology.flatMap((p) =>
                        Object.keys(p)
                    )
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                events: uniq(
                    processed.inserts.events.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                questionnaire: uniq(
                    processed.inserts.questionnaire.flatMap((p) =>
                        Object.keys(p)
                    )
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                relationships: uniq(
                    processed.inserts.relationships.flatMap((p) =>
                        Object.keys(p)
                    )
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
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
                person: uniq(
                    processed.updates.person.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                lab: uniq(
                    processed.updates.lab.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                epidemiology: uniq(
                    processed.updates.epidemiology.flatMap((p) =>
                        Object.keys(p)
                    )
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                events: uniq(
                    processed.updates.events.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                questionnaire: uniq(
                    processed.updates.questionnaire.flatMap((p) =>
                        Object.keys(p)
                    )
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                relationships: uniq(
                    processed.updates.relationships.flatMap((p) =>
                        Object.keys(p)
                    )
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
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
                person: uniq(errors.person.flatMap((p) => Object.keys(p))).map(
                    (col) => ({
                        title: col,
                        render: (_, data) => {
                            let value = getOr("", col, data);
                            if (isArray(value)) return JSON.stringify(value);
                            if (isObject(value)) return JSON.stringify(value);
                            return value;
                        },
                        key: col,
                    })
                ),
                lab: uniq(errors.lab.flatMap((p) => Object.keys(p))).map(
                    (col) => ({
                        title: col,
                        render: (_, data) => {
                            const value = getOr("", col, data);
                            if (isArray(value)) return JSON.stringify(value);
                            if (isObject(value)) return JSON.stringify(value);
                            return value;
                        },
                        key: col,
                    })
                ),
                epidemiology: uniq(
                    errors.epidemiology.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                events: uniq(errors.events.flatMap((p) => Object.keys(p))).map(
                    (col) => ({
                        title: col,
                        render: (text, data) => {
                            const value = getOr("", col, data);
                            if (isArray(value)) return JSON.stringify(value);
                            if (isObject(value)) return JSON.stringify(value);
                            return value;
                        },
                        key: col,
                    })
                ),
                questionnaire: uniq(
                    errors.questionnaire.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                relationships: uniq(
                    errors.relationships.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
            }));
        }
        return () => {};
    }, [JSON.stringify(errors)]);

    useEffect(() => {
        if (conflicts) {
            setConflictColumns((prev) => ({
                ...prev,
                person: uniq(
                    conflicts.person.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                lab: uniq(conflicts.lab.flatMap((p) => Object.keys(p))).map(
                    (col) => ({
                        title: col,
                        render: (_, data) => {
                            const value = getOr("", col, data);
                            if (isArray(value)) return JSON.stringify(value);
                            if (isObject(value)) return JSON.stringify(value);
                            return value;
                        },
                        key: col,
                    })
                ),
                epidemiology: uniq(
                    conflicts.epidemiology.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                events: uniq(
                    conflicts.events.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                questionnaire: uniq(
                    conflicts.questionnaire.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                })),
                relationships: uniq(
                    conflicts.relationships.flatMap((p) => Object.keys(p))
                ).map((col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
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
                        dataSource={data?.person}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.epidemiology}
                        dataSource={data?.epidemiology}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.events}
                        dataSource={data?.events}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.questionnaire}
                        dataSource={data?.questionnaire}
                    />
                </TabPanel>
                <TabPanel>
                    <Table columns={realColumns.lab} dataSource={data?.lab} />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={realColumns.relationships}
                        dataSource={data?.relationships}
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
