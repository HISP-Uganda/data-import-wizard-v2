import { Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    AggDataValue,
    aggLabel,
    convertToAggregate,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { chunk, fromPairs } from "lodash";
import { useEffect, useState } from "react";
import {
    $aggregateMapping,
    $attributionMapping,
    $processedData,
    processedDataApi,
} from "../../pages/aggregate";
import {
    $attributeMapping,
    $data,
    $organisationUnitMapping,
} from "../../pages/program";
import { getDHIS2Resource, getDHIS2SingleResource } from "../../Queries";
import Progress from "../Progress";

export default function Preview() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const aggregateMapping = useStore($aggregateMapping);
    const ouMapping = useStore($organisationUnitMapping);
    const dataMapping = useStore($attributeMapping);
    const attributionMapping = useStore($attributionMapping);
    const data = useStore($data);
    const processedData = useStore($processedData);
    const engine = useDataEngine();
    const columns: ColumnsType<AggDataValue> = [
        {
            title: "Data Element",
            dataIndex: "dataElement",
            key: "dataElement",
        },
        {
            title: "Organisation",
            dataIndex: "orgUnit",
            key: "orgUnit",
        },
        {
            title: "Period",
            dataIndex: "period",
            key: "period",
        },
        {
            title: "Category OptionCombo",
            dataIndex: "categoryOptionCombo",
            key: "categoryOptionCombo",
        },
        {
            title: "Attribute OptionCombo",
            dataIndex: "attributeOptionCombo",
            key: "attributeOptionCombo",
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
        },
    ];

    const queryData = async () => {
        onOpen();
        if (
            [
                "xlsx-line-list",
                "xlsx-tabular-data",
                "xlsx-form",
                "csv-line-list",
            ].indexOf(aggregateMapping.dataSource ?? "") !== -1
        ) {
            const processedData = convertToAggregate({
                mapping: aggregateMapping,
                ouMapping,
                dataMapping,
                data,
                attributionMapping,
            });
            processedDataApi.set(processedData);
        } else if (aggregateMapping.dataSource === "dhis2-data-set") {
            for (const orgUnit of aggregateMapping.dhis2Options?.ous ?? []) {
                for (const p of aggregateMapping.dhis2Options?.period ?? []) {
                    setMessage(
                        () =>
                            `Querying data orgUnit ${orgUnit} and period ${p.value}`
                    );
                    const data = await getDHIS2SingleResource<any>({
                        isCurrentDHIS2: aggregateMapping.isCurrentInstance,
                        auth: aggregateMapping.authentication,
                        engine,
                        resource: "dataValueSets.json",
                        params: {
                            dataSet: aggregateMapping.aggregate?.remote ?? "",
                            orgUnit,
                            children: "true",
                            period: p.value ?? "",
                        },
                    });

                    if (data.dataValues) {
                        setMessage(
                            () =>
                                `Converting data for orgUnit ${orgUnit} and period ${p.value}`
                        );
                        const processedData = convertToAggregate({
                            mapping: aggregateMapping,
                            ouMapping,
                            dataMapping,
                            data: data.dataValues,
                            attributionMapping,
                        });
                        processedDataApi.add(processedData);
                    }
                }
            }
        } else if (
            ["dhis2-indicators", "dhis2-program-indicators"].indexOf(
                aggregateMapping.dataSource ?? ""
            ) !== -1
        ) {
            const allKeys = Object.values(dataMapping).flatMap((a) => {
                if (a.value) {
                    return a.value;
                }
                return [];
            });

            if (allKeys.length > 0) {
                for (const indicators of chunk(allKeys, 25)) {
                    setMessage(
                        () =>
                            `Querying data for orgUnit level ${
                                aggregateMapping.aggregate
                                    ?.indicatorGenerationLevel
                            } and periods ${(
                                aggregateMapping.dhis2Options?.period?.map(
                                    (p) => p.value
                                ) ?? []
                            ).join(";")} for indicators ${indicators.join(";")}`
                    );
                    const data = await getDHIS2SingleResource<{
                        headers: Array<{ name: string }>;
                        rows: string[][];
                    }>({
                        isCurrentDHIS2: aggregateMapping.isCurrentInstance,
                        auth: aggregateMapping.authentication,
                        engine,
                        resource: `analytics.json?dimension=dx:${indicators.join(
                            ";"
                        )}&dimension=ou:LEVEL-${
                            aggregateMapping.aggregate
                                ?.indicatorGenerationLevel ?? []
                        }&dimension=pe:${(
                            aggregateMapping.dhis2Options?.period?.map(
                                (p) => p.value
                            ) ?? []
                        ).join(";")}`,
                    });

                    setMessage(
                        () =>
                            `Processing and converting data for orgUnit level ${
                                aggregateMapping.aggregate
                                    ?.indicatorGenerationLevel
                            } and periods ${(
                                aggregateMapping.dhis2Options?.period?.map(
                                    (p) => p.value
                                ) ?? []
                            ).join(";")} for indicators ${indicators.join(";")}`
                    );
                    if (data.rows && data.rows.length > 0) {
                        const finalData = data.rows.map((row) =>
                            fromPairs(
                                row.map((r, index) => [
                                    data.headers?.[index].name,
                                    r,
                                ])
                            )
                        );
                        const processedData = convertToAggregate({
                            mapping: aggregateMapping,
                            ouMapping,
                            dataMapping,
                            data: finalData,
                            attributionMapping,
                        });
                        processedDataApi.add(processedData);
                    }
                }
            }
        }
        onClose();
    };

    useEffect(() => {
        queryData();
        return () => {};
    }, []);

    return (
        <Stack>
            <Table
                columns={columns}
                dataSource={processedData}
                rowKey={(r) =>
                    `${r.dataElement}${r.orgUnit}${r.period}${r.categoryOptionCombo}${r.attributeOptionCombo}`
                }
            />

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
