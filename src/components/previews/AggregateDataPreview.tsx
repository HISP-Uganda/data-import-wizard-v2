import { Stack, useDisclosure } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Table } from "antd";
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import { processedDataApi } from "../../Events";
import {
    $attributeMapping,
    $attributionMapping,
    $data,
    $mapping,
    $organisationUnitMapping,
    $processedData,
} from "../../Store";
import { aggregateDataColumns, processAggregateData } from "../../utils/utils";
import Progress from "../Progress";

export default function AggregateDataPreview() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = useState<string>("");
    const mapping = useStore($mapping);
    const ouMapping = useStore($organisationUnitMapping);
    const dataMapping = useStore($attributeMapping);
    const attributionMapping = useStore($attributionMapping);
    const data = useStore($data);
    const processedData = useStore($processedData);
    const engine = useDataEngine();
    const queryData = async () => {
        onOpen();
        await processAggregateData({
            mapping,
            attributionMapping,
            dataMapping,
            data,
            dataCallback: async (aggDataValue) => {
                processedDataApi.add(aggDataValue);
            },
            engine,
            ouMapping,
            setMessage,
        });
        onClose();
    };

    useEffect(() => {
        processedDataApi.set([]);
        queryData();
        return () => {};
    }, []);

    return (
        <Stack>
            <Table
                columns={aggregateDataColumns}
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
