import { Stack, Text, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import type { TabsProps } from "antd";
import { Badge, Table, Tabs } from "antd";
import { Mapping } from "data-import-wizard-utils";

import { useStore } from "effector-react";
import { useEffect } from "react";
import { CQIDexie } from "../../db";
import { invalidDataApi, processedDataApi } from "../../Events";
import {
    $data,
    $dataSet,
    $invalidData,
    $mapping,
    $processedData,
} from "../../Store";
import {
    invalidDataColumns,
    makeAggregateColumns,
    processAggregateData,
} from "../../utils/utils";
import Progress from "../Progress";
export default function AggregatePreviewTable({
    mappings: { attributionMapping, dataMapping, organisationUnitMapping },
    db,
}: {
    mappings: {
        dataMapping: Mapping;
        attributionMapping: Mapping;
        organisationUnitMapping: Mapping;
    };
    db: CQIDexie;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const engine = useDataEngine();
    const data = useStore($data);
    const dataSet = useStore($dataSet);
    const mapping = useStore($mapping);
    const processedData = useStore($processedData);
    const invalidData = useStore($invalidData);
    const queryData = async () => {
        onOpen();
        await processAggregateData({
            mapping,
            attributionMapping,
            dataMapping,
            data,
            dataCallback: ({ validData, invalidData }) => {
                processedDataApi.add(validData);
                invalidDataApi.add(invalidData);
            },
            engine,
            organisationUnitMapping,
            setMessage: async (message: string) => {
                await db.messages.put({
                    message,
                    id: 1,
                });
            },
        });

        onClose();
    };

    useEffect(() => {
        queryData();
        return () => {};
    }, []);

    const des = dataSet.dataSetElements?.reduce<Record<string, string>>(
        (a, b) => {
            if (b.dataElement) {
                a[b.dataElement.id] = b.dataElement.name;
            }
            return a;
        },
        {},
    );

    const ous = dataSet.organisationUnits?.reduce<Record<string, string>>(
        (a, b) => {
            a[b.id] = b.name;
            return a;
        },
        {},
    );

    const aoc = dataSet.categoryCombo?.categoryOptionCombos?.reduce<
        Record<string, string>
    >((a, b) => {
        a[b.id] = b.name;
        return a;
    }, {});

    const coc = dataSet.dataSetElements
        ?.flatMap((a) => a.dataElement.categoryCombo?.categoryOptionCombos)
        .reduce<Record<string, string>>((a, b) => {
            a[b.id] = b.name;
            return a;
        }, {});

    const items: TabsProps["items"] = [
        {
            key: "1",
            label: (
                <Badge count={processedData?.length} offset={[15, -5]}>
                    <Text>Data Values</Text>
                </Badge>
            ),
            children: (
                <Table
                    columns={makeAggregateColumns({
                        ...coc,
                        ...ous,
                        ...des,
                        ...aoc,
                    })}
                    dataSource={processedData}
                    rowKey={(r) =>
                        `${r.dataElement}${r.orgUnit}${r.period}${r.categoryOptionCombo}${r.attributeOptionCombo}`
                    }
                    pagination={{ pageSize: 8 }}
                />
            ),
        },
        {
            key: "2",
            label: (
                <Badge count={invalidData?.length} offset={[15, -5]}>
                    <Text>Conflicts/Errors</Text>
                </Badge>
            ),
            children: (
                <Table
                    columns={invalidDataColumns(invalidData)}
                    dataSource={invalidData}
                    rowKey={(r) =>
                        `${r.dataElement}${r.orgUnit}${r.period}${r.categoryOptionCombo}${r.attributeOptionCombo}`
                    }
                    pagination={{ pageSize: 8 }}
                />
            ),
        },
    ];

    return (
        <Stack>
            <Tabs items={items} />
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
