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
import Table, { ColumnsType } from "antd/es/table";
import { AxiosInstance } from "axios";
import {
    convertFromDHIS2,
    convertToGoData,
    fetchEvents,
    fetchGoDataData,
    fetchTrackedEntityInstances,
    flattenTrackedEntityInstances,
    groupGoData4Insert,
    insertTrackerData,
    postRemote,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { isArray, isObject, uniq } from "lodash";
import { getOr } from "lodash/fp";
import { useEffect, useState } from "react";
import {
    $attributeMapping,
    $goData,
    $optionMapping,
    $organisationUnitMapping,
    $otherProcessed,
    $prevGoData,
    $processed,
    $processedGoDataData,
    $program,
    $mapping,
    $programStageMapping,
    $programStageUniqueElements,
    $programUniqAttributes,
    $remoteAPI,
    $tokens,
} from "../../Store";
import { $version } from "../../Store";
import Progress from "../Progress";
import Superscript from "../Superscript";

import { processInstances } from "../../utils/utils";

export default function ProgramImportSummary() {
    const toast = useToast();
    const engine = useDataEngine();
    const version = useStore($version);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const program = useStore($program);
    const programStageMapping = useStore($programStageMapping);
    const mapping = useStore($mapping);
    const attributeMapping = useStore($attributeMapping);
    const programUniqAttributes = useStore($programUniqAttributes);
    const programStageUniqueElements = useStore($programStageUniqueElements);
    const optionMapping = useStore($optionMapping);
    const tokens = useStore($tokens);
    const otherProcessed = useStore($otherProcessed);
    const processedGoDataData = useStore($processedGoDataData);
    const prevGoData = useStore($prevGoData);
    const goData = useStore($goData);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const processed = useStore($processed);
    const remoteAPI = useStore($remoteAPI);
    const [message, setMessage] = useState<string>("");
    const [inserted, setInserted] = useState<any[]>([]);
    const [errored, setErrored] = useState<any[]>([]);
    const [updates, setUpdates] = useState<any[]>([]);

    const [insertedColumns, setInsertedColumns] = useState<ColumnsType<any>>(
        []
    );
    const [updatedColumns, setUpdatedColumns] = useState<ColumnsType<any>>([]);
    const [erroredColumns, setErroredColumns] = useState<ColumnsType<any>>([]);

    const [instanceConflictsColumns, setInstanceConflictsColumns] = useState<
        ColumnsType<any>
    >([]);
    const [enrollmentConflictsColumns, setEnrollmentConflictsColumns] =
        useState<ColumnsType<any>>([]);
    const [eventConflictsColumns, setEventConflictsColumns] = useState<
        ColumnsType<any>
    >([]);

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

    const updateResponse = (
        response: {
            conflicts: any[];
            imported: number;
            updated: number;
            deleted: number;
            total: number;
            ignored: number;
        },
        conflictsUpdate: React.Dispatch<React.SetStateAction<any[]>>,
        conflictColumnsUpdate: React.Dispatch<
            React.SetStateAction<ColumnsType<any>>
        >,
        feedBackUpdate: React.Dispatch<
            React.SetStateAction<{
                total: number;
                updated: number;
                deleted: number;
                ignored: number;
                imported: number;
            }>
        >
    ) => {
        if (response.conflicts && response.conflicts.flat().length > 0) {
            conflictsUpdate((prev) => prev.concat(response.conflicts.flat()));
            conflictColumnsUpdate(() =>
                Object.keys(response.conflicts.flat()[0]).map((key) => ({
                    key,
                    dataIndex: key,
                    title: key,
                }))
            );
        }
        feedBackUpdate((prev) => ({
            deleted: prev.deleted + response.deleted,
            total: prev.total + response.total,
            ignored: prev.ignored + response.ignored,
            updated: prev.updated + response.updated,
            imported: prev.imported + response.imported,
        }));
    };

    useEffect(() => {
        if (isArray(inserted) && inserted.length > 0) {
            setInsertedColumns(() =>
                uniq(inserted.flatMap((e) => Object.keys(e))).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }))
            );
        }
        return () => {};
    }, [JSON.stringify(inserted)]);

    useEffect(() => {
        if (isArray(updates) && updates.length > 0) {
            setInsertedColumns(() =>
                uniq(updates.flatMap((e) => Object.keys(e))).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }))
            );
        }
        return () => {};
    }, [JSON.stringify(updates)]);

    useEffect(() => {
        if (errored.length > 0) {
            setErroredColumns(() =>
                uniq(errored.flatMap((e) => Object.keys(e)))
                    .filter((c) => c !== "details")
                    .map((col) => ({
                        title: col,
                        render: (_, data) => {
                            let value = getOr("", col, data);
                            if (isArray(value)) return JSON.stringify(value);
                            if (isObject(value)) return JSON.stringify(value);
                            return value;
                        },
                        key: col,
                    }))
            );
        }
        return () => {};
    }, [JSON.stringify(errored)]);

    useEffect(() => {
        if (updates.length > 0) {
            setUpdatedColumns(() =>
                Object.keys(updates[0]).map((col) => ({
                    title: col,
                    render: (_, data) => {
                        let value = getOr("", col, data);
                        if (isArray(value)) return JSON.stringify(value);
                        if (isObject(value)) return JSON.stringify(value);
                        return value;
                    },
                    key: col,
                }))
            );
        }
        return () => {};
    }, [JSON.stringify(updates)]);

    const fetchAndInsert = async () => {
        setErrored(() => []);
        setUpdates(() => []);
        setInserted(() => []);
        setInstanceConflicts(() => []);
        setEnrollmentConflicts(() => []);
        setEventConflicts(() => []);
        setEventFeedback(() => ({
            deleted: 0,
            total: 0,
            ignored: 0,
            updated: 0,
            imported: 0,
        }));
        setEnrollmentFeedback(() => ({
            deleted: 0,
            total: 0,
            ignored: 0,
            updated: 0,
            imported: 0,
        }));
        setInstanceFeedback(() => ({
            deleted: 0,
            total: 0,
            ignored: 0,
            updated: 0,
            imported: 0,
        }));

        onOpen();
        if (mapping.isSource) {
            if (mapping.dataSource === "dhis2-program") {
            } else if (mapping.dataSource === "go-data") {
                const {
                    params,
                    basicAuth,
                    hasNextLink,
                    headers,
                    password,
                    username,
                    ...rest
                } = mapping.authentication || {};

                if (mapping.prefetch) {
                    const { conflicts, errors, processed } =
                        processedGoDataData;
                    if (processed) {
                        const { updates, inserts } = processed;
                        await groupGoData4Insert(
                            goData,
                            inserts,
                            updates,
                            prevGoData,
                            mapping.authentication || {},
                            setMessage,
                            setInserted,
                            setUpdates,
                            setErrored
                        );
                    }
                } else {
                    const { metadata, prev } = await fetchGoDataData(
                        goData,
                        mapping.authentication || {}
                    );
                    await fetchTrackedEntityInstances(
                        {
                            api: { engine },
                            program: mapping.program?.program,
                            additionalParams: {},
                            uniqueAttributeValues: [],
                            withAttributes: false,
                            trackedEntityInstances: [],
                        },
                        async (trackedEntityInstances, page) => {
                            setMessage(
                                () =>
                                    `Working on page ${page} for tracked entities`
                            );
                            const { processed, errors, conflicts } =
                                convertToGoData(
                                    flattenTrackedEntityInstances(
                                        {
                                            trackedEntityInstances,
                                        },
                                        "ALL"
                                    ),
                                    organisationUnitMapping,
                                    attributeMapping,
                                    goData,
                                    optionMapping,
                                    tokens,
                                    metadata
                                );
                            const { inserts, updates } = processed;
                            await groupGoData4Insert(
                                goData,
                                inserts,
                                updates,
                                prev,
                                mapping.authentication || {},
                                setMessage,
                                setInserted,
                                setUpdates,
                                setErrored
                            );
                        }
                    );
                }
            } else if (mapping.dataSource === "api") {
                const { newInserts } = otherProcessed;
                if (mapping.prefetch && newInserts) {
                    for (const payload of newInserts) {
                        const response = await postRemote<any>(
                            mapping.authentication,
                            "",
                            payload,
                            {}
                        );
                    }
                } else {
                    if (mapping.dhis2SourceOptions?.programStage) {
                        const data = await fetchEvents(
                            { engine },
                            mapping.dhis2SourceOptions.programStage,
                            50,
                            mapping.program?.program || ""
                        );
                        const actual = await convertFromDHIS2(
                            data as any,
                            mapping,
                            organisationUnitMapping,
                            attributeMapping,
                            true,
                            optionMapping
                        );

                        for (const payload of actual) {
                            try {
                                const response = await postRemote<any>(
                                    mapping.authentication,
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
                            {
                                api: { engine },
                                program: mapping.program?.program,
                                additionalParams: {},
                                uniqueAttributeValues: [],
                                withAttributes: false,
                                trackedEntityInstances: [],
                            },
                            async (trackedEntityInstances, page) => {
                                setMessage(
                                    () =>
                                        `Working on page ${page} for tracked entities`
                                );
                                const actual = await convertFromDHIS2(
                                    flattenTrackedEntityInstances(
                                        {
                                            trackedEntityInstances,
                                        },
                                        "ALL"
                                    ),
                                    mapping,
                                    organisationUnitMapping,
                                    attributeMapping,
                                    false,
                                    optionMapping
                                );

                                for (const payload of actual) {
                                    try {
                                        const response = await postRemote<any>(
                                            mapping.authentication,
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
        } else if (mapping.dataSource === "dhis2-program") {
            let api: Partial<{ engine: any; axios: AxiosInstance }> = {};
            if (mapping.isCurrentInstance) {
                api = { engine };
            } else {
                api = { axios: remoteAPI };
            }
            if (mapping.prefetch) {
                await insertTrackerData({
                    processedData: processed,
                    callBack: (message: string) => setMessage(() => message),
                    api: { engine },
                    instanceCallBack: (response) => {
                        updateResponse(
                            response,
                            setInstanceConflicts,
                            setInstanceConflictsColumns,
                            setInstanceFeedback
                        );
                    },
                    enrollmentsCallBack: (response) => {
                        updateResponse(
                            response,
                            setEnrollmentConflicts,
                            setEnrollmentConflictsColumns,
                            setEnrollmentFeedback
                        );
                    },
                    eventsCallBack: (response) => {
                        updateResponse(
                            response,
                            setEventConflicts,
                            setEventConflictsColumns,
                            setEventFeedback
                        );
                    },
                });
            } else {
                await fetchTrackedEntityInstances(
                    {
                        api,
                        program: mapping.program?.remoteProgram,
                        withAttributes: false,
                        uniqueAttributeValues: [],
                        additionalParams: {},
                        trackedEntityInstances: [],
                    },
                    async (trackedEntityInstances, { pager }) => {
                        setMessage(
                            () =>
                                `Finished fetching page ${pager?.page} of ${pager?.pageCount} from source`
                        );
                        await processInstances(
                            {
                                engine,
                                trackedEntityInstances,
                                mapping,
                                version,
                                attributeMapping,
                                program,
                                programStageMapping,
                                optionMapping,
                                organisationUnitMapping,
                                programStageUniqueElements,
                                programUniqAttributes,
                                setMessage,
                            },
                            async (data) => {
                                await insertTrackerData({
                                    processedData: data,
                                    callBack: (message: string) =>
                                        setMessage(() => message),
                                    api: { engine },
                                    instanceCallBack: (response) =>
                                        updateResponse(
                                            response,
                                            setInstanceConflicts,
                                            setInstanceConflictsColumns,
                                            setInstanceFeedback
                                        ),
                                    enrollmentsCallBack: (response) =>
                                        updateResponse(
                                            response,
                                            setEnrollmentConflicts,
                                            setEnrollmentConflictsColumns,
                                            setEnrollmentFeedback
                                        ),
                                    eventsCallBack: (response) => {
                                        updateResponse(
                                            response,
                                            setEventConflicts,
                                            setEventConflictsColumns,
                                            setEventFeedback
                                        );
                                    },
                                });
                            }
                        );
                    }
                );
            }
        } else if (mapping.dataSource === "go-data" && !mapping.prefetch) {
            console.log("We seem to be in a wrong place");
        } else {
            await insertTrackerData({
                processedData: processed,
                callBack: (message: string) => setMessage(() => message),
                api: { engine },
                instanceCallBack: (response) =>
                    updateResponse(
                        response,
                        setInstanceConflicts,
                        setInstanceConflictsColumns,
                        setInstanceFeedback
                    ),
                enrollmentsCallBack: (response) =>
                    updateResponse(
                        response,
                        setEnrollmentConflicts,
                        setEnrollmentConflictsColumns,
                        setEnrollmentFeedback
                    ),

                eventsCallBack: (response) =>
                    updateResponse(
                        response,
                        setEventConflicts,
                        setEventConflictsColumns,
                        setEventFeedback
                    ),
            });
        }
        onClose();
    };
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
                        <Table
                            columns={insertedColumns}
                            dataSource={inserted}
                            rowKey="visualId"
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: true }}
                        />
                    </TabPanel>
                    <TabPanel>
                        <Table
                            columns={updatedColumns}
                            dataSource={updates}
                            rowKey="visualId"
                        />
                    </TabPanel>
                    <TabPanel>
                        <Table
                            columns={erroredColumns}
                            dataSource={errored}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <Text textAlign="center">
                                        {JSON.stringify(
                                            record.details,
                                            null,
                                            2
                                        )}
                                    </Text>
                                ),
                            }}
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
                        <StatNumber>{instanceFeedback.ignored}</StatNumber>
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
                            <Table
                                columns={instanceConflictsColumns}
                                dataSource={instanceConflicts}
                                rowKey="visualId"
                                pagination={{ pageSize: 5 }}
                            />
                        </TabPanel>
                        <TabPanel>
                            <Table
                                columns={enrollmentConflictsColumns}
                                dataSource={enrollmentConflicts}
                                rowKey="visualId"
                                pagination={{ pageSize: 5 }}
                            />
                        </TabPanel>
                        <TabPanel>
                            <Table
                                columns={eventConflictsColumns}
                                dataSource={eventConflicts}
                                rowKey="visualId"
                                pagination={{ pageSize: 5 }}
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
            {!mapping.isSource && createDHIS2Response()}
            {mapping.isSource &&
                mapping.dataSource === "go-data" &&
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
