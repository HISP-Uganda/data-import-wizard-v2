import {
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { ColumnDef } from "@tanstack/react-table";
import {
    convertToDHIS2,
    Enrollment,
    Event,
    processPreviousInstances,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { chunk, groupBy } from "lodash/fp";
import { useEffect, useMemo, useState } from "react";
import {
    $attributeMapping,
    $data,
    $metadata,
    $optionMapping,
    $organisationUnitMapping,
    $processed,
    $program,
    $programMapping,
    $programStageMapping,
    $programStageUniqueElements,
    $programTypes,
    $programUniqAttributes,
    $programUniqColumns,
    processor,
} from "../../pages/program/Store";
import { $version } from "../../Store";
import Progress from "../Progress";
import TableDisplay from "../TableDisplay";

const Superscript = ({
    value,
    fontSize = "12px",
    color = "white",
    h = "25px",
    bg = "green",
}: {
    value: number;
    h?: string;
    bg?: string;
    fontSize?: string;
    color?: string;
}) => {
    return (
        <sup>
            <Text
                fontSize={fontSize}
                color={color}
                borderRadius="50%"
                bg={bg}
                h={h}
                lineHeight={h}
                mb="15px"
                ml="-6px"
                w={h}
            >
                {value < 100 ? value : "99+"}
            </Text>
        </sup>
    );
};

export default function Preview() {
    const version = useStore($version);
    const metadata = useStore($metadata);
    const program = useStore($program);
    const { attributes, elements } = useStore($programTypes);
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

    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($programMapping);
    const programStageMapping = useStore($programStageMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const programUniqAttributes = useStore($programUniqAttributes);
    const programStageUniqueElements = useStore($programStageUniqueElements);
    const programUniqColumns = useStore($programUniqColumns);
    const optionMapping = useStore($optionMapping);
    const processed = useStore($processed);
    const data = useStore($data);
    const [message, setMessage] = useState<string>("");

    const process = async () => {
        onOpen();
        setMessage(() => "Fetching previous data");
        let foundInstances: Array<TrackedEntityInstance> = [];
        for (const attributeValues of chunk(
            50,
            metadata.uniqueAttributeValues
        )) {
            let params = new URLSearchParams();
            Object.entries(groupBy("attribute", attributeValues)).forEach(
                ([attribute, values]) => {
                    params.append(
                        "filter",
                        `${attribute}:in:${values
                            .map(({ value }) => value)
                            .join(";")}`
                    );
                }
            );
            params.append("fields", "*");
            params.append("program", programMapping.program || "");
            params.append("ouMode", "ALL");
            const {
                data: { trackedEntityInstances },
            }: any = await engine.query({
                data: {
                    resource: `trackedEntityInstances.json?${params.toString()}`,
                },
            });
            foundInstances = [...foundInstances, ...trackedEntityInstances];
        }

        const previous = processPreviousInstances(
            foundInstances,
            programUniqAttributes,
            programStageUniqueElements,
            programMapping.program || ""
        );
        const {
            enrollments,
            events,
            trackedEntityInstances: processedInstances,
        } = await convertToDHIS2(
            previous,
            data,
            programMapping,
            organisationUnitMapping,
            attributeMapping,
            programStageMapping,
            optionMapping,
            version,
            program,
            elements,
            attributes
        );
        processor.addInstances(processedInstances);
        processor.addEnrollments(enrollments);
        processor.addEvents(events);
        onClose();
    };

    useEffect(() => {
        process();
        return () => {};
    }, []);
    return (
        <Stack>
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
                    </Tab>
                    <Tab>
                        <Text>Events Updates</Text>
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
                        />
                    </TabPanel>
                    <TabPanel>
                        <TableDisplay<Partial<Event>>
                            columns={eventColumns}
                            generatedData={processed.events || []}
                            queryKey={["events", processed.events?.length || 0]}
                        />
                    </TabPanel>
                    <TabPanel>
                        <pre>
                            {JSON.stringify(processed.trackedEntities, null, 2)}
                        </pre>
                    </TabPanel>
                    <TabPanel>5</TabPanel>
                    <TabPanel>6</TabPanel>
                    <TabPanel>7</TabPanel>
                    <TabPanel>8</TabPanel>
                </TabPanels>
            </Tabs>
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
