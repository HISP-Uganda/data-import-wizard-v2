import {
    Stack,
    Stat,
    StatLabel,
    StatNumber,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { ColumnDef } from "@tanstack/react-table";
import {
    convertFromDHIS2,
    convertToGoData,
    Event,
    fetchEvents,
    fetchRemote,
    fetchTrackedEntityInstances,
    flattenTrackedEntityInstances,
    GODataTokenGenerationResponse,
    IGoDataData,
    postRemote,
    putRemote,
    TrackedEntityInstance,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { response } from "express";
import { chunk, groupBy, isArray } from "lodash";
import { useEffect, useMemo, useState } from "react";
import {
    $attributeMapping,
    $goData,
    $optionMapping,
    $organisationUnitMapping,
    $otherProcessed,
    $processed,
    $programMapping,
    $remoteAPI,
    $tokens,
} from "../../pages/program/Store";
import { $version } from "../../Store";
import Progress from "../Progress";
import Superscript from "../Superscript";
import TableDisplay from "../TableDisplay";

export default function Step7() {
    const toast = useToast();
    const engine = useDataEngine();
    const version = useStore($version);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const programMapping = useStore($programMapping);
    const attributeMapping = useStore($attributeMapping);
    const optionMapping = useStore($optionMapping);
    const tokens = useStore($tokens);
    const otherProcessed = useStore($otherProcessed);
    const goData = useStore($goData);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const processed = useStore($processed);
    const remoteAPI = useStore($remoteAPI);
    const [found, setFound] = useState<any>([]);
    const [message, setMessage] = useState<string>("");
    const [inserted, setInserted] = useState<any[]>([]);
    const [errored, setErrored] = useState<any[]>([]);
    const [conflicted, setConflicted] = useState<any[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);

    const [insertedColumns, setInsertedColumns] = useState<ColumnDef<any>[]>(
        []
    );
    const [updatedColumns, setUpdatedColumns] = useState<ColumnDef<any>[]>([]);
    const [erroredColumns, setErroredColumns] = useState<ColumnDef<any>[]>([]);

    const [feedback, setFeedback] = useState<{
        total: number;
        updated: number;
        deleted: number;
        ignored: number;
        imported: number;
    }>({ total: 0, updated: 0, deleted: 0, ignored: 0, imported: 0 });

    const [instanceFeedback, setInstanceFeedback] = useState<{
        total: number;
        updated: number;
        deleted: number;
        ignored: number;
        imported: number;
    }>({ total: 0, updated: 0, deleted: 0, ignored: 0, imported: 0 });
    const [enrollmentFeedback, setEnrollmentFeedback] = useState<{
        total: number;
        updated: number;
        deleted: number;
        ignored: number;
        imported: number;
    }>({ total: 0, updated: 0, deleted: 0, ignored: 0, imported: 0 });

    const [eventFeedback, setEventFeedback] = useState<{
        total: number;
        updated: number;
        deleted: number;
        ignored: number;
        imported: number;
    }>({ total: 0, updated: 0, deleted: 0, ignored: 0, imported: 0 });

    const [instanceConflicts, setInstanceConflicts] = useState<any[]>([]);
    const [enrollmentConflicts, setEnrollmentConflicts] = useState<any[]>([]);
    const [eventConflicts, setEventConflicts] = useState<any[]>([]);

    useEffect(() => {
        if (isArray(inserted) && inserted.length > 0) {
            setInsertedColumns(() =>
                Object.keys(inserted[0]).map((col) => ({
                    accessorKey: col,
                    header: col,
                }))
            );
        }
        return () => {};
    }, [JSON.stringify(inserted)]);

    useEffect(() => {
        if (isArray(updates) && updates.length > 0) {
            setInsertedColumns(() =>
                Object.keys(inserted[0]).map((col) => ({
                    accessorKey: col,
                    header: col,
                }))
            );
        }
        return () => {};
    }, [JSON.stringify(inserted)]);

    useEffect(() => {
        if (errored.length > 0) {
            setErroredColumns(() =>
                Object.keys(errored[0]).map((col) => ({
                    accessorKey: col,
                    header: col,
                }))
            );
        }
        return () => {};
    }, [JSON.stringify(errored)]);

    useEffect(() => {
        if (updates.length > 0) {
            setUpdatedColumns(() =>
                Object.keys(updates[0]).map((col) => ({
                    accessorKey: col,
                    header: col,
                }))
            );
        }
        return () => {};
    }, [JSON.stringify(updates)]);

    const insertIntoGoData = async (data: any[] | undefined) => {
        if (data) {
            const {
                params,
                basicAuth,
                hasNextLink,
                headers,
                password,
                username,
                ...rest
            } = programMapping.authentication || {};
            try {
                setMessage(() => "Getting auth token");
                const response =
                    await postRemote<GODataTokenGenerationResponse>(
                        rest,
                        "api/users/login",
                        {
                            email: username,
                            password,
                        }
                    );
                if (response) {
                    const token = response.id;
                    for (const { id, ...goDataCase } of data) {
                        try {
                            if (id) {
                                const response = await putRemote<any>(
                                    {
                                        ...rest,
                                    },
                                    `api/outbreaks/${goData.id}/cases/${id}`,
                                    goDataCase,
                                    {
                                        auth: {
                                            param: "access_token",
                                            value: token,
                                        },
                                    }
                                );
                                setUpdates((prev) => [...prev, response]);
                            } else {
                                const response = await postRemote<any>(
                                    {
                                        ...rest,
                                    },
                                    `api/outbreaks/${goData.id}/cases`,
                                    goDataCase,
                                    {
                                        auth: {
                                            param: "access_token",
                                            value: token,
                                        },
                                    }
                                );
                                setInserted((prev) => [...prev, response]);
                            }
                        } catch (error: any) {
                            const keys = Object.keys(error);
                            if (keys.indexOf("response") !== -1) {
                                const { error: e } = error.response.data;
                                setErrored((prev) => [
                                    ...prev,
                                    { ...goDataCase, ...e },
                                ]);
                                toast({
                                    title: "Post/Put Failed",
                                    description: e?.message,
                                    status: "error",
                                    duration: 9000,
                                    isClosable: true,
                                });
                            } else {
                                setErrored((prev) => [
                                    ...prev,
                                    { ...goDataCase, message: error?.message },
                                ]);
                                toast({
                                    title: "Post/Put Failed",
                                    description: error?.message,
                                    status: "error",
                                    duration: 9000,
                                    isClosable: true,
                                });
                            }
                        }
                    }
                }
            } catch (error: any) {
                toast({
                    title: "Fetch Failed",
                    description: error?.message,
                    status: "error",
                    duration: 9000,
                    isClosable: true,
                });
            }
        }
    };

    const fetchAndInsert = async () => {
        onOpen();
        if (programMapping.isSource) {
            if (programMapping.dataSource === "dhis2") {
            } else if (programMapping.dataSource === "godata") {
                const {
                    params,
                    basicAuth,
                    hasNextLink,
                    headers,
                    password,
                    username,
                    ...rest
                } = programMapping.authentication || {};

                const response =
                    await postRemote<GODataTokenGenerationResponse>(
                        rest,
                        "api/users/login",
                        {
                            email: username,
                            password,
                        }
                    );
                const prev = await fetchRemote<Array<Partial<IGoDataData>>>(
                    rest,
                    `api/outbreaks/${goData.id}/cases`,
                    {
                        auth: {
                            param: "access_token",
                            value: response.id,
                            forUpdates: false,
                        },
                    }
                );
                if (programMapping.prefetch) {
                    const { newInserts, updates } = otherProcessed;
                    if (newInserts && updates) {
                        await insertIntoGoData([...newInserts, ...updates]);
                    } else if (newInserts) {
                        await insertIntoGoData(newInserts);
                    } else if (updates) {
                        await insertIntoGoData(updates);
                    }
                } else {
                    await fetchTrackedEntityInstances(
                        { engine },
                        programMapping,
                        {},
                        [],
                        false,
                        async (trackedEntityInstances, page) => {
                            setMessage(
                                () =>
                                    `Working on page ${page} for tracked entities`
                            );
                            const { inserts, updates, errors, conflicts } =
                                convertToGoData(
                                    flattenTrackedEntityInstances({
                                        trackedEntityInstances,
                                    }),
                                    organisationUnitMapping,
                                    attributeMapping,
                                    goData,
                                    optionMapping,
                                    tokens,
                                    prev
                                );
                            setErrored((prev) => [...prev, errors]);
                            setConflicted((prev) => [...prev, conflicts]);
                            await insertIntoGoData([...inserts, ...updates]);
                        }
                    );
                }
            } else if (programMapping.dataSource === "api") {
                const { newInserts } = otherProcessed;
                if (programMapping.prefetch && newInserts) {
                    for (const payload of newInserts) {
                        const response = await postRemote<any>(
                            programMapping.authentication,
                            "",
                            payload,
                            {}
                        );
                    }
                } else {
                    if (programMapping.dhis2Options?.programStage) {
                        const data = await fetchEvents(
                            { engine },
                            programMapping.dhis2Options.programStage,
                            50,
                            programMapping.program || ""
                        );
                        const actual = await convertFromDHIS2(
                            data as any,
                            programMapping,
                            organisationUnitMapping,
                            attributeMapping,
                            true,
                            optionMapping
                        );

                        for (const payload of actual) {
                            try {
                                const response = await postRemote<any>(
                                    programMapping.authentication,
                                    "",
                                    payload,
                                    {}
                                );
                            } catch (error: any) {
                                toast({
                                    title: "insert Failed",
                                    description: error?.message,
                                    status: "error",
                                    duration: 9000,
                                    isClosable: true,
                                });
                            }
                        }
                    } else {
                        await fetchTrackedEntityInstances(
                            { engine },
                            programMapping,
                            {},
                            [],
                            false,
                            async (trackedEntityInstances, page) => {
                                setMessage(
                                    () =>
                                        `Working on page ${page} for tracked entities`
                                );
                                const actual = await convertFromDHIS2(
                                    flattenTrackedEntityInstances({
                                        trackedEntityInstances,
                                    }),
                                    programMapping,
                                    organisationUnitMapping,
                                    attributeMapping,
                                    false,
                                    optionMapping
                                );

                                for (const payload of actual) {
                                    try {
                                        const response = await postRemote<any>(
                                            programMapping.authentication,
                                            "",
                                            payload,
                                            {}
                                        );
                                    } catch (error: any) {
                                        toast({
                                            title: "insert Failed",
                                            description: error?.message,
                                            status: "error",
                                            duration: 9000,
                                            isClosable: true,
                                        });
                                    }
                                }
                            }
                        );
                    }
                }
            }
        } else if (programMapping.dataSource === "dhis2") {
            if (remoteAPI) {
                const { data } = await remoteAPI.get<{
                    trackedEntityInstances: Array<TrackedEntityInstance>;
                }>("api/trackedEntityInstances.json", {
                    params: {
                        program: programMapping.remoteProgram,
                        fields: "*",
                        ouMode: "ALL",
                        pageSize: 1,
                        page: 1,
                    },
                });
                setFound(() => flattenTrackedEntityInstances(data));
            }
        } else if (
            programMapping.dataSource === "godata" &&
            !programMapping.prefetch
        ) {
            console.log("We seem to be in a wrong place");
        } else {
            const {
                enrollments,
                events,
                trackedEntities,
                trackedEntityUpdates,
                eventsUpdates,
            } = processed;
            let eventsWithout: string[] = [];
            let enrollmentsWithout: string[] = [];
            const groupedEvents = groupBy(events, "enrollment");
            const groupedEnrollments = groupBy(
                enrollments,
                "trackedEntityInstance"
            );
            let allTrackedEntities: Array<Partial<TrackedEntityInstance>> = [];
            let allEvents: Array<Partial<Event>> = [];

            if (trackedEntities) {
                allTrackedEntities = [
                    ...allTrackedEntities,
                    ...trackedEntities,
                ];
            }

            if (trackedEntityUpdates) {
                allTrackedEntities = [
                    ...allTrackedEntities,
                    ...trackedEntityUpdates,
                ];
            }

            if (events) {
                allEvents = [...allEvents, ...events];
            }
            if (eventsUpdates) {
                allEvents = [...allEvents, ...eventsUpdates];
            }
            setMessage(() => "Regrouping tracked entity instances");
            const trackedEntityInstances = allTrackedEntities.flatMap(
                (entity) => {
                    if (entity.trackedEntityInstance) {
                        const enrollments =
                            groupedEnrollments[entity.trackedEntityInstance] ||
                            [];

                        const processedEnrollments = enrollments.flatMap(
                            (enrollment) => {
                                if (enrollment.enrollment) {
                                    const events =
                                        groupedEvents[enrollment.enrollment] ||
                                        [];
                                    eventsWithout = [
                                        ...eventsWithout,
                                        ...allEvents.flatMap(({ event }) => {
                                            if (event) {
                                                return event;
                                            }
                                            return [];
                                        }),
                                    ];
                                    return { ...enrollment, events };
                                }
                                enrollmentsWithout.push(
                                    enrollment.enrollment || ""
                                );
                                return enrollment;
                            }
                        );
                        return {
                            ...entity,
                            enrollments: processedEnrollments,
                        };
                    }
                    return entity;
                }
            );

            const currentTotal = trackedEntityInstances.length;
            let current = 0;
            setMessage(() => `Found ${currentTotal} instances`);
            for (const instances of chunk(trackedEntityInstances, 50)) {
                current = current + instances.length;
                setMessage(
                    () => `Creating tracked entities ${current}/${currentTotal}`
                );
                try {
                    const {
                        response: {
                            status,
                            deleted,
                            ignored,
                            total,
                            updated,
                            importSummaries,
                            imported,
                        },
                    }: any = await engine.mutate({
                        type: "create",
                        resource: "trackedEntityInstances",
                        data: { trackedEntityInstances: instances },
                    });
                    setInstanceFeedback((prev) => ({
                        deleted: prev.deleted + deleted,
                        total: prev.total + total,
                        ignored: prev.ignored + ignored,
                        updated: prev.updated + updated,
                        imported: prev.imported + imported,
                    }));
                    importSummaries.forEach(
                        ({
                            enrollments: {
                                imported,
                                updated,
                                deleted,
                                ignored,
                                importSummaries,
                            },
                            conflicts,
                        }: any) => {
                            setEnrollmentFeedback((prev) => ({
                                deleted: prev.deleted + deleted,
                                total: prev.total + total,
                                ignored: prev.ignored + ignored,
                                updated: prev.updated + updated,
                                imported: prev.imported + imported,
                            }));
                            setInstanceConflicts((prev) => [
                                ...prev,
                                ...conflicts,
                            ]);

                            importSummaries.forEach(
                                ({
                                    events: {
                                        imported,
                                        updated,
                                        deleted,
                                        ignored,
                                        importSummaries,
                                    },
                                    conflicts,
                                }: any) => {
                                    setEventFeedback((prev) => ({
                                        deleted: prev.deleted + deleted,
                                        total: prev.total + total,
                                        ignored: prev.ignored + ignored,
                                        updated: prev.updated + updated,
                                        imported: prev.imported + imported,
                                    }));
                                    setEnrollmentConflicts((prev) => [
                                        ...prev,
                                        ...conflicts,
                                    ]);

                                    importSummaries.forEach(
                                        ({ conflicts }: any) => {
                                            setEventConflicts((prev) => [
                                                ...prev,
                                                ...conflicts,
                                            ]);
                                        }
                                    );
                                }
                            );
                        }
                    );
                } catch (error: any) {
                    toast({
                        title: "Failed to insert",
                        description: error?.message,
                        status: "error",
                        duration: 9000,
                        isClosable: true,
                    });
                }
            }

            const missingEnrollments =
                enrollments?.filter(
                    ({ enrollment }) =>
                        enrollmentsWithout.indexOf(enrollment || "") !== -1
                ) || [];
            if (missingEnrollments.length > 0) {
                const currentTotal = missingEnrollments.length;
                let current = 0;

                setMessage(
                    () =>
                        `Found ${currentTotal} enrollments with existing tracked entities`
                );

                for (const missingEnrolls of chunk(missingEnrollments, 50)) {
                    current = current + missingEnrolls.length;
                    setMessage(
                        () => `Creating enrollments ${current}/${currentTotal}`
                    );
                    try {
                        const {
                            response: {
                                deleted,
                                ignored,
                                total,
                                updated,
                                importSummaries,
                                imported,
                            },
                        }: any = await engine.mutate({
                            type: "create",
                            resource: "enrollments",
                            data: {
                                enrollments: missingEnrollments,
                            },
                        });

                        setEnrollmentFeedback((prev) => ({
                            deleted: prev.deleted + deleted,
                            total: prev.total + total,
                            ignored: prev.ignored + ignored,
                            updated: prev.updated + updated,
                            imported: prev.imported + imported,
                        }));

                        importSummaries.forEach(
                            ({
                                events: {
                                    imported,
                                    updated,
                                    deleted,
                                    ignored,
                                    importSummaries,
                                },
                                conflicts,
                            }: any) => {
                                setEventFeedback((prev) => ({
                                    deleted: prev.deleted + deleted,
                                    total: prev.total + total,
                                    ignored: prev.ignored + ignored,
                                    updated: prev.updated + updated,
                                    imported: prev.imported + imported,
                                }));
                                setEnrollmentConflicts((prev) => [
                                    ...prev,
                                    ...conflicts,
                                ]);

                                importSummaries.forEach(
                                    ({ conflicts }: any) => {
                                        setEventConflicts((prev) => [
                                            ...prev,
                                            ...conflicts,
                                        ]);
                                    }
                                );
                            }
                        );
                    } catch (error: any) {
                        toast({
                            title: "Failed to insert",
                            description: error?.message,
                            status: "error",
                            duration: 9000,
                            isClosable: true,
                        });
                        console.log(error);
                    }
                }
            }

            const missingEvents = allEvents.filter(
                ({ event }) => eventsWithout.indexOf(event || "") === -1
            );

            if (missingEvents.length > 0) {
                const currentTotal = missingEvents.length;
                let current = 0;

                setMessage(
                    () =>
                        `Found ${currentTotal} events with existing enrollments`
                );
                for (const missingEves of chunk(missingEvents, 50)) {
                    current = current + missingEves.length;
                    setMessage(
                        () => `Creating events ${current}/${currentTotal}`
                    );
                    try {
                        const {
                            response: {
                                deleted,
                                ignored,
                                total,
                                updated,
                                importSummaries,
                                imported,
                            },
                        }: any = await engine.mutate({
                            type: "create",
                            resource: "events",
                            data: {
                                events: missingEvents,
                            },
                        });
                        setEventFeedback((prev) => ({
                            deleted: prev.deleted + deleted,
                            total: prev.total + total,
                            ignored: prev.ignored + ignored,
                            updated: prev.updated + updated,
                            imported: prev.imported + imported,
                        }));

                        importSummaries.forEach(({ conflicts }: any) => {
                            setEventConflicts((prev) => [
                                ...prev,
                                ...conflicts,
                            ]);
                        });
                    } catch (error: any) {
                        const {
                            response: {
                                deleted,
                                ignored,
                                total,
                                updated,
                                importSummaries,
                                imported,
                            },
                        }: any = error.details;

                        setEventFeedback((prev) => ({
                            deleted: prev.deleted + deleted,
                            total: prev.total + total,
                            ignored: prev.ignored + ignored,
                            updated: prev.updated + updated,
                            imported: prev.imported + imported,
                        }));
                        importSummaries.forEach(
                            ({ conflicts, description }: any) => {
                                if (conflicts.length > 0) {
                                    setEventConflicts((prev) => [
                                        ...prev,
                                        ...conflicts,
                                    ]);
                                } else {
                                    setEventConflicts((prev) => [
                                        ...prev,
                                        { value: description },
                                    ]);
                                }
                            }
                        );
                        toast({
                            title: "Failed to insert",
                            description: error?.message,
                            status: "error",
                            duration: 9000,
                            isClosable: true,
                        });
                    }
                }
            }
        }
        onClose();
    };
    const eventColumns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "value",
                header: "Conflict",
            },
        ],
        []
    );
    const createGoDataResponse = () => {
        return (
            <Tabs>
                <TabList>
                    <Tab>
                        <Text>Created</Text>
                        <Superscript value={inserted.length} bg="blue.500" />
                    </Tab>
                    <Tab>
                        <Text>Updated</Text>
                        <Superscript value={updates.length} bg="blue.500" />
                    </Tab>
                    <Tab>
                        <Text>Errored</Text>
                        <Superscript value={errored.length} bg="blue.500" />
                    </Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <TableDisplay<any>
                            columns={insertedColumns}
                            generatedData={inserted}
                            idField="visualId"
                            queryKey={[
                                "created",
                                JSON.stringify(inserted || []),
                            ]}
                        />
                    </TabPanel>
                    <TabPanel>
                        <TableDisplay<any>
                            columns={updatedColumns}
                            generatedData={updates}
                            idField="visualId"
                            queryKey={[
                                "updated",
                                JSON.stringify(updates || []),
                            ]}
                        />
                    </TabPanel>
                    <TabPanel>
                        <TableDisplay<any>
                            columns={erroredColumns}
                            generatedData={errored}
                            idField="visualId"
                            queryKey={[
                                "errored",
                                JSON.stringify(errored || []),
                            ]}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        );
    };
    const createDHIS2Response = () => {
        return (
            <>
                <Stack direction="row">
                    <Stat textAlign="center">
                        <StatLabel>Total Instances</StatLabel>
                        <StatNumber>{instanceFeedback.total}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Instances Imported</StatLabel>
                        <StatNumber>{instanceFeedback.imported}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Instance Updates</StatLabel>
                        <StatNumber>{instanceFeedback.updated}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Instances Deleted</StatLabel>
                        <StatNumber>{instanceFeedback.deleted}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Instances Ignored</StatLabel>
                        <StatNumber>{instanceFeedback.deleted}</StatNumber>
                    </Stat>
                </Stack>

                <Stack direction="row">
                    <Stat textAlign="center">
                        <StatLabel>Total Enrollments</StatLabel>
                        <StatNumber>{enrollmentFeedback.total}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Enrollments Imported</StatLabel>
                        <StatNumber>{enrollmentFeedback.imported}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Enrollment Updates</StatLabel>
                        <StatNumber>{enrollmentFeedback.updated}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Enrollments Deleted</StatLabel>
                        <StatNumber>{enrollmentFeedback.deleted}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Enrollments Ignored</StatLabel>
                        <StatNumber>{enrollmentFeedback.ignored}</StatNumber>
                    </Stat>
                </Stack>
                <Stack direction="row">
                    <Stat textAlign="center">
                        <StatLabel>Total Events</StatLabel>
                        <StatNumber>{eventFeedback.total}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Events Imported</StatLabel>
                        <StatNumber>{eventFeedback.imported}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Event Updates</StatLabel>
                        <StatNumber>{eventFeedback.updated}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Events Deleted</StatLabel>
                        <StatNumber>{eventFeedback.deleted}</StatNumber>
                    </Stat>
                    <Stat textAlign="center">
                        <StatLabel>Events Ignored</StatLabel>
                        <StatNumber>{eventFeedback.ignored}</StatNumber>
                    </Stat>
                </Stack>
                <Tabs>
                    <TabList>
                        <Tab>
                            <Text>Instance Conflicts</Text>
                            <Superscript
                                value={instanceConflicts.length}
                                bg="blue.500"
                            />
                        </Tab>
                        <Tab>
                            <Text>Enrollment Conflicts</Text>
                            <Superscript
                                value={enrollmentConflicts.length}
                                bg="blue.500"
                            />
                        </Tab>
                        <Tab>
                            <Text>Events Conflicts</Text>
                            <Superscript
                                value={eventConflicts.length}
                                bg="blue.500"
                            />
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <TableDisplay<any>
                                columns={eventColumns}
                                generatedData={instanceConflicts}
                                queryKey={["instance conflicts"]}
                            />
                        </TabPanel>
                        <TabPanel>
                            <TableDisplay<any>
                                columns={eventColumns}
                                generatedData={enrollmentConflicts}
                                queryKey={["enrollment conflicts"]}
                            />
                        </TabPanel>
                        <TabPanel>
                            <TableDisplay<any>
                                columns={eventColumns}
                                generatedData={eventConflicts}
                                queryKey={["event conflicts"]}
                            />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </>
        );
    };

    useEffect(() => {
        fetchAndInsert();
    }, []);
    return (
        <Stack spacing="20px">
            {!programMapping.isSource && createDHIS2Response()}
            {programMapping.isSource &&
                programMapping.dataSource === "godata" &&
                createGoDataResponse()}
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
