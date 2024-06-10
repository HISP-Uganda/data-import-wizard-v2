import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";

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
import { $allNames, $processed } from "../../Store";
import { isArray, isObject } from "lodash";
import { getOr } from "lodash/fp";
export default function TrackerDataPreview() {
    const processed = useStore($processed);
    const allNames = useStore($allNames);
    const columns: TableColumnsType<Partial<Attribute>> = [
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
                let value = getOr("", "value", record);
                if (isArray(value)) return JSON.stringify(value);
                if (isObject(value)) return JSON.stringify(value);
                return value;
            },
        },
    ];

    const dataValueColumns: TableColumnsType<Partial<DataValue>> = [
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
        []
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
        []
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
        ],
        []
    );

    const conflictColumns = useMemo<ColumnsType<any>>(
        () =>
            Object.keys(processed.conflicts?.[0] ?? {})
                .filter((i) => i !== "id")
                .map((a) => ({
                    title: a,
                    key: a,
                    render: (_, record) => allNames[record[a]] || record[a],
                })),
        [Object.keys(processed.conflicts?.[0] ?? {})]
    );
    const errorColumns = useMemo<ColumnsType<any>>(
        () =>
            Object.keys(processed.errors?.[0] ?? {})
                .filter((i) => i !== "id")
                .map((a) => ({
                    title: a,
                    render: (_, record) => allNames[record[a]] || record[a],
                    key: a,
                })),
        [Object.keys(processed.errors?.[0] ?? {})]
    );

    return (
        <Tabs>
            <TabList>
                <Tab>
                    <Text fontSize="18px">New Entities</Text>
                    <Superscript
                        value={processed.trackedEntityInstances?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>New Enrollments</Text>
                    <Superscript
                        value={processed.enrollments?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>New Events</Text>
                    <Superscript
                        value={processed.events?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Entity Updates</Text>
                    <Superscript
                        value={
                            processed.trackedEntityInstanceUpdates?.length || 0
                        }
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Events Updates</Text>
                    <Superscript
                        value={processed.eventUpdates?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Conflicts</Text>
                    <Superscript
                        value={processed.conflicts?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Errors</Text>
                    <Superscript
                        value={processed.errors?.length || 0}
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
                        dataSource={processed.trackedEntityInstances}
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
                        dataSource={processed.enrollments}
                        rowKey="enrollment"
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={eventColumns}
                        dataSource={processed.events}
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
                        dataSource={processed.trackedEntityInstanceUpdates}
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
                        columns={eventColumns}
                        dataSource={processed.eventUpdates}
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
                        dataSource={processed.conflicts}
                        rowKey="id"
                    />
                </TabPanel>
                <TabPanel>
                    <Table
                        columns={errorColumns}
                        dataSource={processed.errors}
                        rowKey="id"
                    />
                </TabPanel>
            </TabPanels>
        </Tabs>
    );
}
