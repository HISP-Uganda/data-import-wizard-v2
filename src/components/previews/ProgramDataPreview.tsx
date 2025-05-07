import { Button, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { AxiosInstance } from "axios";
import { convert, isExcel, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import saveAs from "file-saver";
import { useEffect } from "react";
import { CQIDexie } from "../../db";
import { processor } from "../../Events";
import { useOneLiveQuery } from "../../hooks/useOneLiveQuery";
import {
    $attributeMapping,
    $attributionMapping,
    $data,
    $enrollmentMapping,
    $goData,
    $goDataOptions,
    $mapping,
    $metadata,
    $optionMapping,
    $organisationUnitMapping,
    $processed,
    $program,
    $programStageMapping,
    $remoteAPI,
    $tokens,
} from "../../Store";

import { $version } from "../../Store";
import GoDataPreview from "../GoDataPreview";
import Progress from "../Progress";
import SwitchComponent, { Case } from "../SwitchComponent";
import ExcelExportPreview from "./ExcelExportPreview";
import OtherSystemPreview from "./OtherSystemPreview";
import TrackerDataPreview from "./TrackerDataPreview";

export default function ProgramDataPreview({ db }: { db: CQIDexie }) {
    const version = useStore($version);
    const metadata = useStore($metadata);
    const program = useStore($program);
    const tokens = useStore($tokens);
    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const mapping = useStore($mapping);
    const optionMapping = useStore($optionMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const enrollmentMapping = useStore($enrollmentMapping);
    const attributeMapping = useStore($attributeMapping);
    const attributionMapping = useStore($attributionMapping);
    const programStageMapping = useStore($programStageMapping);
    const goData = useStore($goData);
    const data = useStore($data);
    const remoteApi = useStore($remoteAPI);
    const processed = useStore($processed);
    const referenceData = useStore($goDataOptions);

    const levels = useOneLiveQuery<Option>(db.levels.toArray(), []);

    const process = async () => {
        onOpen();
        processor.reset();
        let sourceApi: Partial<{ engine: any; axios: AxiosInstance }> = {};
        let destinationApi: Partial<{ engine: any; axios: AxiosInstance }> = {};
        if (mapping.isSource) {
            sourceApi = { engine };
            destinationApi = { axios: remoteApi };
        } else if (mapping.isCurrentInstance) {
            sourceApi = { engine };
            destinationApi = { engine };
        } else if (remoteApi) {
            sourceApi = { axios: remoteApi };
            destinationApi = { engine };
        } else {
            destinationApi = { engine };
        }
        await db.messages.put({
            message: "Fetching data",
            id: 1,
        });

        let excelData: any[] = [];
        await convert({
            afterConversion: (converted, pager) => {
                processor.addGoData(converted);
                processor.addDHIS2Data(converted);
                if (
                    mapping.isSource &&
                    mapping.dataSource &&
                    isExcel(mapping)
                ) {
                    excelData = excelData.concat(converted.processedData);
                } else {
                    processor.addProcessedData(converted);
                }

                if (
                    (pager && pager.page === pager.pageCount) ||
                    pager === undefined
                ) {
                    onClose();
                }
            },
            attributeMapping,
            programStageMapping,
            mapping,
            sourceApi,
            destinationApi,
            optionMapping,
            enrollmentMapping,
            version,
            additionalParams: {},
            setMessage: async (message) => {
                await db.messages.put({
                    message,
                    id: 1,
                });
            },
            organisationUnitMapping,
            goData,
            data,
            tokens,
            program,
            metadata,
            referenceData,
            attributionMapping,
        });
        if (
            mapping.isSource &&
            mapping.dataSource &&
            ["csv-line-list", "xlsx-line-list"].indexOf(mapping.dataSource) !==
                -1
        ) {
            processor.addProcessedData({
                ...processed,
                processedData: excelData,
            });
        }
    };

    useEffect(() => {
        process();
        return () => {};
    }, []);

    const download = () => {
        if (!mapping.isSource) {
            const enrollments = new Blob(
                [JSON.stringify(processed.dhis2.enrollments)],
                {
                    type: "application/json",
                },
            );
            const trackedEntityInstances = new Blob(
                [JSON.stringify(processed.dhis2.trackedEntityInstances)],
                {
                    type: "application/json",
                },
            );
            const events = new Blob([JSON.stringify(processed.dhis2.events)], {
                type: "application/json",
            });
            saveAs(enrollments, "enrollments.json");
            saveAs(trackedEntityInstances, "trackedEntityInstances.json");
            saveAs(events, "events.json");
        }
    };

    if (levels === null) return <Text>Loading...</Text>;

    return (
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            <SwitchComponent condition={mapping.isSource}>
                <Case value={true}>
                    <SwitchComponent condition={mapping.dataSource}>
                        <Case value="csv-line-list">
                            <ExcelExportPreview />
                        </Case>
                        <Case value="xlsx-line-list">
                            <ExcelExportPreview />
                        </Case>
                        <Case value="go-data">
                            <GoDataPreview />
                        </Case>
                        <Case value="json">JSON</Case>
                        <Case value="fhir">FHIR</Case>
                        <Case value="api">
                            <OtherSystemPreview />
                        </Case>
                        <Case default>
                            <OtherSystemPreview />
                        </Case>
                    </SwitchComponent>
                </Case>
                <Case default>
                    <TrackerDataPreview />
                </Case>
            </SwitchComponent>
            <Stack>
                <Button onClick={download}>Download Data</Button>
            </Stack>
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
