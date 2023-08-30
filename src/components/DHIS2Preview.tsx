import {
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { ColumnDef } from "@tanstack/react-table";
import {
    Enrollment,
    Event,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { useMemo } from "react";
import Superscript from "./Superscript";

import { $processed } from "../pages/program/Store";
import TableDisplay from "./TableDisplay";
export default function DHIS2Preview() {
    const processed = useStore($processed);
    const instanceColumns = useMemo<
        ColumnDef<Partial<TrackedEntityInstance>>[]
    >(
        () => [
            {
                accessorKey: "trackedEntityInstance",
                header: "Tracked Entity Instance",
            },
            {
                accessorKey: "orgUnit",
                header: "Organisation",
            },
            {
                accessorKey: "trackedEntityType",
                header: "Tracked Entity Type",
            },
        ],
        []
    );
    const enrollmentColumns = useMemo<ColumnDef<Partial<Enrollment>>[]>(
        () => [
            {
                accessorKey: "enrollment",
                header: "Enrollment",
            },
            {
                accessorKey: "trackedEntityInstance",
                header: "Tracked Entity Instance",
            },
            {
                accessorKey: "enrollmentDate",
                header: "Enrollment Date",
            },
            {
                accessorKey: "incidentDate",
                header: "Incident Date",
            },
        ],
        []
    );
    const eventColumns = useMemo<ColumnDef<Partial<Event>>[]>(
        () => [
            {
                accessorKey: "event",
                header: "Event",
            },
            {
                accessorKey: "eventDate",
                header: "Event Date",
            },
            {
                accessorKey: "orgUnit",
                header: "Organisation",
            },
            {
                accessorKey: "programStage",
                header: "Program Stage",
            },
            {
                accessorKey: "trackedEntityInstance",
                header: "Tracked Entity Instance",
            },
        ],
        []
    );

    return (
        <Tabs>
            <TabList>
                <Tab>
                    <Text fontSize="18px">New Entities</Text>
                    <Superscript
                        value={processed.trackedEntities?.length || 0}
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
                        value={processed.trackedEntityUpdates?.length || 0}
                        bg="blue.500"
                    />
                </Tab>
                <Tab>
                    <Text>Events Updates</Text>
                    <Superscript
                        value={processed.eventsUpdates?.length || 0}
                        bg="blue.500"
                    />
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
                    <TableDisplay<Partial<TrackedEntityInstance>>
                        columns={instanceColumns}
                        generatedData={processed.trackedEntities || []}
                        queryKey={[
                            "instances",
                            processed.trackedEntities?.length || 0,
                        ]}
                        idField="trackedEntityInstance"
                    />
                </TabPanel>
                <TabPanel>
                    <TableDisplay<Partial<Enrollment>>
                        columns={enrollmentColumns}
                        generatedData={processed.enrollments || []}
                        queryKey={[
                            "enrollments",
                            processed.enrollments?.length || 0,
                        ]}
                        idField="enrollment"
                    />
                </TabPanel>
                <TabPanel>
                    <TableDisplay<Partial<Event>>
                        columns={eventColumns}
                        generatedData={processed.events || []}
                        queryKey={["events", processed.events?.length || 0]}
                        idField="event"
                    />
                </TabPanel>
                <TabPanel>
                    <TableDisplay<Partial<TrackedEntityInstance>>
                        columns={instanceColumns}
                        generatedData={processed.trackedEntityUpdates || []}
                        queryKey={[
                            "instances-updates",
                            processed.trackedEntityUpdates?.length || 0,
                        ]}
                        idField="trackedEntityInstance"
                    />
                </TabPanel>
                <TabPanel>
                    <TableDisplay<Partial<TrackedEntityInstance>>
                        columns={eventColumns}
                        generatedData={processed.eventsUpdates || []}
                        queryKey={[
                            "events-updates",
                            processed.eventsUpdates?.length || 0,
                        ]}
                        idField="event"
                    />
                </TabPanel>
                <TabPanel>6</TabPanel>
                <TabPanel>7</TabPanel>
                <TabPanel>8</TabPanel>
            </TabPanels>
        </Tabs>
    );
}
