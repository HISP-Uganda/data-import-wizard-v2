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
import { $processed } from "../Store";
import Superscript from "./Superscript";

export default function GoDataPreview() {
    const {
        goData: { inserts, updates, errors, conflicts },
    } = useStore($processed);
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

    useEffect(() => {
        setColumns((prev) => ({
            ...prev,
            person: uniq(inserts.person.flatMap((p) => Object.keys(p))).map(
                (col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }),
            ),
            lab: uniq(inserts.lab.flatMap((p) => Object.keys(p))).map(
                (col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }),
            ),
            epidemiology: uniq(
                inserts.epidemiology.flatMap((p) => Object.keys(p)),
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
            events: uniq(inserts.events.flatMap((p) => Object.keys(p))).map(
                (col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }),
            ),
            questionnaire: uniq(
                inserts.questionnaire.flatMap((p) => Object.keys(p)),
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
                inserts.relationships.flatMap((p) => Object.keys(p)),
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

        return () => {};
    }, [JSON.stringify(inserts)]);

    useEffect(() => {
        setUpdateColumns((prev) => ({
            ...prev,
            person: uniq(updates.person.flatMap((p) => Object.keys(p))).map(
                (col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }),
            ),
            lab: uniq(updates.lab.flatMap((p) => Object.keys(p))).map(
                (col) => ({
                    title: col,
                    render: (_, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }),
            ),
            epidemiology: uniq(
                updates.epidemiology.flatMap((p) => Object.keys(p)),
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
            events: uniq(updates.events.flatMap((p) => Object.keys(p))).map(
                (col) => ({
                    title: col,
                    render: (text, data) => {
                        const value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }),
            ),
            questionnaire: uniq(
                updates.questionnaire.flatMap((p) => Object.keys(p)),
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
                updates.relationships.flatMap((p) => Object.keys(p)),
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

        return () => {};
    }, [JSON.stringify(updates)]);

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
                    }),
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
                    }),
                ),
                epidemiology: uniq(
                    errors.epidemiology.flatMap((p) => Object.keys(p)),
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
                    }),
                ),
                questionnaire: uniq(
                    errors.questionnaire.flatMap((p) => Object.keys(p)),
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
                    errors.relationships.flatMap((p) => Object.keys(p)),
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
                    conflicts.person.flatMap((p) => Object.keys(p)),
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
                    }),
                ),
                epidemiology: uniq(
                    conflicts.epidemiology.flatMap((p) => Object.keys(p)),
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
                    conflicts.events.flatMap((p) => Object.keys(p)),
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
                    conflicts.questionnaire.flatMap((p) => Object.keys(p)),
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
                    conflicts.relationships.flatMap((p) => Object.keys(p)),
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
        data: GoResponse,
        realColumns: {
            person: ColumnsType<any>;
            epidemiology: ColumnsType<any>;
            events: ColumnsType<any>;
            relationships: ColumnsType<any>;
            lab: ColumnsType<any>;
            questionnaire: ColumnsType<any>;
        },
    ) => (
        <Tabs>
            <TabList>
                <Tab>
                    <Text>Person</Text>
                    <Superscript value={data.person.length} bg="green.500" />
                </Tab>
                <Tab>
                    <Text>Epidemiology</Text>
                    <Superscript
                        value={data?.epidemiology.length}
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Events</Text>
                    <Superscript value={data?.events.length} bg="green.500" />
                </Tab>
                <Tab>
                    <Text>Questionnaire</Text>
                    <Superscript
                        value={data?.questionnaire.length}
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Lab</Text>
                    <Superscript value={data?.lab.length} bg="green.500" />
                </Tab>
                <Tab>
                    <Text>Relationships</Text>
                    <Superscript
                        value={data?.relationships.length}
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
                            inserts.person.length +
                            inserts.epidemiology.length +
                            inserts.events.length +
                            inserts.lab.length +
                            inserts.questionnaire.length +
                            inserts.relationships.length
                        }
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text fontSize="18px">Updates</Text>
                    <Superscript
                        value={
                            updates.person.length +
                            updates.epidemiology.length +
                            updates.events.length +
                            updates.lab.length +
                            updates.questionnaire.length +
                            updates.relationships.length
                        }
                        bg="green.500"
                    />
                </Tab>
                <Tab>
                    <Text>Conflicts</Text>
                    <Superscript
                        value={
                            conflicts?.person.length +
                            conflicts?.epidemiology.length +
                            conflicts?.events.length +
                            conflicts?.lab.length +
                            conflicts?.questionnaire.length +
                            conflicts?.relationships.length
                        }
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Errors</Text>
                    <Superscript
                        value={
                            errors?.person.length +
                            errors?.epidemiology.length +
                            errors?.events.length +
                            errors?.lab.length +
                            errors?.questionnaire.length +
                            errors?.relationships.length
                        }
                        bg="red.500"
                    />
                </Tab>
            </TabList>
            <TabPanels>
                <TabPanel>{innerTabs(inserts, columns)}</TabPanel>
                <TabPanel>{innerTabs(updates, updateColumns)}</TabPanel>
                <TabPanel>{innerTabs(conflicts, conflictColumns)}</TabPanel>
                <TabPanel>{innerTabs(errors, errorColumns)}</TabPanel>
            </TabPanels>
        </Tabs>
    );
}
