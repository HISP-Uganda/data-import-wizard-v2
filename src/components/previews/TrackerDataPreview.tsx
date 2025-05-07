import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import type { TableColumnsType } from "antd";
import { Table } from "antd";

import {
    Attribute,
    DataValue,
    Enrollment,
    Event,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useMemo } from "react";
import Superscript from "../Superscript";

import { ColumnsType } from "antd/es/table";
import { isArray, isObject } from "lodash";
import { getOr } from "lodash/fp";
import { $allNames, $processed } from "../../Store";
export default function TrackerDataPreview() {
    const processed = useStore($processed);
    const allNames = useStore($allNames);
    const columns: TableColumnsType<Partial<Attribute>> = [
        {
            title: "Data Element ID",
            dataIndex: "attribute",
            key: "attribute",
        },
        {
            title: "Attribute",
            render: (_, record) =>
                allNames[record["attribute"] ?? ""] || record["attribute"],
            key: "attribute",
        },
        {
            title: "Value",
            key: "value",
            render: (_, record) => {
                const value = getOr("", "value", record);
                if (isArray(value) || isObject(value))
                    return JSON.stringify(value);
                return value;
            },
        },
    ];

    const dataValueColumns: TableColumnsType<Partial<DataValue>> = [
        {
            title: "Data Element ID",
            dataIndex: "dataElement",
            key: "dataElement",
        },
        {
            title: "Data Element",
            render: (_, record) =>
                allNames[record["dataElement"] ?? ""] || record["dataElement"],
            key: "dataElement",
        },
        {
            title: "Value",
            key: "value",
            render: (_, record) => {
                let value = getOr("", "value", record);
                if (isArray(value)) return JSON.stringify(value);
                if (isObject(value)) return JSON.stringify(value);
                return value;
            },
        },
    ];

    const instanceColumns = useMemo<
        ColumnsType<Partial<TrackedEntityInstance>>
    >(
        () => [
            {
                key: "trackedEntityInstance",
                dataIndex: "trackedEntityInstance",
                title: "Tracked Entity Instance",
            },
            {
                key: "orgUnit",
                render: (_, record) =>
                    allNames[record["orgUnit"] ?? ""] || record["orgUnit"],
                title: "Organisation",
            },
            {
                key: "trackedEntityType",
                dataIndex: "trackedEntityType",
                title: "Tracked Entity Type",
            },
        ],
        [],
    );
    const enrollmentColumns = useMemo<ColumnsType<Partial<Enrollment>>>(
        () => [
            {
                key: "enrollment",
                dataIndex: "enrollment",
                title: "Enrollment",
            },
            {
                key: "trackedEntityInstance",
                dataIndex: "trackedEntityInstance",
                title: "Tracked Entity Instance",
            },
            {
                key: "enrollmentDate",
                dataIndex: "enrollmentDate",
                title: "Enrollment Date",
            },
            {
                key: "incidentDate",
                dataIndex: "incidentDate",
                title: "Incident Date",
            },
            {
                key: "geometry",
                title: "Geometry",
                render: (text, record) => {
                    return JSON.stringify(text.geometry);
                },
            },
        ],
        [],
    );
    const eventColumns = useMemo<ColumnsType<Partial<Event>>>(
        () => [
            {
                dataIndex: "event",
                key: "event",
                title: "Event",
            },
            {
                dataIndex: "eventDate",
                key: "eventDate",
                title: "Event Date",
            },
            {
                render: (_, record) =>
                    allNames[record["orgUnit"] ?? ""] || record["orgUnit"],
                key: "orgUnit",
                title: "Organisation",
            },
            {
                render: (_, record) =>
                    allNames[record["programStage"] ?? ""] ||
                    record["programStage"],
                key: "programStage",
                title: "Program Stage",
            },
            {
                dataIndex: "trackedEntityInstance",
                key: "trackedEntityInstance",
                title: "Tracked Entity Instance",
            },
            {
                dataIndex: "enrollment",
                key: "enrollment",
                title: "Enrollment",
            },
            {
                dataIndex: "attributeOptionCombo",
                key: "attributeOptionCombo",
                title: "Attribution",
            },
        ],
        [],
    );

    const conflictColumns = useMemo<ColumnsType<any>>(
        () =>
            Object.keys(processed.dhis2.conflicts?.[0] ?? {}).map((a) => ({
                title: a,
                key: a,
                render: (_, record) => allNames[record[a]] || record[a],
            })),
        [Object.keys(processed.dhis2.conflicts?.[0] ?? {})],
    );
    const errorColumns = useMemo<ColumnsType<any>>(() => {
        const currentColumns = new Set<string>();
        processed.dhis2.errors.forEach((error) => {
            Object.keys(error).forEach((a) => currentColumns.add(a));
        });
        return Array.from(currentColumns)
            .filter((i) => i !== "id")
            .map((a) => ({
                title: a,
                render: (_, record) => allNames[record[a]] || record[a],
                key: a,
            }));
    }, [Object.keys(processed.dhis2.errors?.[0] ?? {})]);

    return (
        <Tabs>
            <TabList>
                <Tab>
                    <Text fontSize="18px">New Entities</Text>
                    <Superscript
                        value={
                            processed.dhis2.trackedEntityInstances?.length || 0
                        }
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>New Enrollments</Text>
                    <Superscript
                        value={processed.dhis2.enrollments?.length || 0}
                        bg="blue.500"
                    />
                </Tab>

                <Tab>
                    <Text>New Events</Text>
                    <Superscript
                        value={processed.dhis2.events?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Entity Updates</Text>
                    <Superscript
                        value={
                            processed.dhis2.trackedEntityInstanceUpdates
                                ?.length || 0
                        }
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Enrollment Updates</Text>
                    <Superscript
                        value={processed.dhis2.enrollmentUpdates?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Events Updates</Text>
                    <Superscript
                        value={processed.dhis2.eventUpdates?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Conflicts</Text>
                    <Superscript
                        value={processed.dhis2.conflicts?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Errors</Text>
                    <Superscript
                        value={processed.dhis2.errors.length}
                        bg="blue.500"
                    />
                </Tab>
                {/* <Tab>
                    <Text>Duplicates</Text>
                </Tab> */}
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Table
                        columns={instanceColumns}
                        dataSource={processed.dhis2.trackedEntityInstances}
                        rowKey="trackedEntityInstance"
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={columns}
                                    dataSource={record.attributes}
                                    pagination={false}
                                    rowKey="attribute"
                                />
                            ),
                        }}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={enrollmentColumns}
                        dataSource={processed.dhis2.enrollments}
                        rowKey="enrollment"
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={columns}
                                    dataSource={record.attributes}
                                    pagination={false}
                                    rowKey="attribute"
                                />
                            ),
                        }}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={eventColumns}
                        dataSource={processed.dhis2.events}
                        rowKey="event"
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={dataValueColumns}
                                    dataSource={record.dataValues}
                                    pagination={false}
                                    rowKey="dataElement"
                                />
                            ),
                        }}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={instanceColumns}
                        dataSource={
                            processed.dhis2.trackedEntityInstanceUpdates
                        }
                        rowKey="trackedEntityInstance"
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={columns}
                                    dataSource={record.attributes}
                                    pagination={false}
                                    rowKey="attribute"
                                />
                            ),
                        }}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={enrollmentColumns}
                        dataSource={processed.dhis2.enrollmentUpdates}
                        rowKey="enrollment"
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={columns}
                                    dataSource={record.attributes}
                                    pagination={false}
                                    rowKey="attribute"
                                />
                            ),
                        }}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={eventColumns}
                        dataSource={processed.dhis2.eventUpdates}
                        rowKey="event"
                        expandable={{
                            expandedRowRender: (record) => (
                                <Table
                                    columns={dataValueColumns}
                                    dataSource={record.dataValues}
                                    pagination={false}
                                    rowKey="dataElement"
                                />
                            ),
                        }}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={conflictColumns}
                        dataSource={processed.dhis2.conflicts}
                        rowKey={(r) => `${r.id}-${r.uniqueKey}-${r.value}`}
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={errorColumns}
                        dataSource={processed.dhis2.errors}
                        rowKey={(r) => `${r.id}-${r.uniqueKey}-${r.value}`}
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
