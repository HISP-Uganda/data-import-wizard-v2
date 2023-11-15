import { ColumnDef } from "@tanstack/react-table";
import { Box, Spinner, Stack, useDisclosure } from "@chakra-ui/react";
import React, { useMemo, useEffect } from "react";
import { getDHIS2Resource, loadProgram, useDHIS2Metadata } from "../../Queries";
import TableDisplay from "../TableDisplay";
import { useStore } from "effector-react";
import {
    $aggregateMapping,
    aggregateMappingApi,
    dataSetApi,
    indicatorApi,
    programIndicatorApi,
} from "../../pages/aggregate";
import Progress from "../Progress";
import { stepper } from "../../Store";
import { useDataEngine } from "@dhis2/app-runtime";
import { IDataSet, Option } from "data-import-wizard-utils";

export default function DataSetSelect() {
    const aggregateMapping = useStore($aggregateMapping);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const engine = useDataEngine();
    const { isLoading, isError, isSuccess, error, data } = useDHIS2Metadata<{
        id: string;
        name: string;
    }>("dataSets", 1, 100, "id,name");

    const columns = useMemo<ColumnDef<Partial<{ id: string; name: string }>>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                size: 20,
            },
            {
                accessorKey: "name",
                header: "Name",
                size: 20,
            },
        ],
        []
    );

    const dataSetSelect = async (id: string) => {
        onOpen();
        const dataSet = await loadProgram<IDataSet>({
            resource: "dataSets",
            engine,
            id,
            fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
        });
        dataSetApi.set(dataSet);
        aggregateMappingApi.update({
            attribute: "aggregate",
            key: "dataSet",
            value: id,
        });
        onClose();
        stepper.next();
    };

    const loadMetadata = async () => {
        onOpen();
        if (
            aggregateMapping.aggregate?.dataSource ===
            "dhis2-program-indicators"
        ) {
            const data = await getDHIS2Resource<Option>({
                isCurrentDHIS2: aggregateMapping.isCurrentInstance,
                engine,
                resource: "programIndicators",
                resourceKey: "programIndicators",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    paging: "false",
                },
            });
            programIndicatorApi.set(data);
        }
        if (aggregateMapping.aggregate?.dataSource === "dhis2-indicators") {
            const data = await getDHIS2Resource<Option>({
                isCurrentDHIS2: aggregateMapping.isCurrentInstance,
                engine,
                resource: "indicators",
                resourceKey: "indicators",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    paging: "false",
                },
            });
            indicatorApi.set(data);
        }
        onClose();
    };

    useEffect(() => {
        loadMetadata();
        return () => {
            // indicatorApi.reset();
            // programIndicatorApi.reset();
        };
    }, []);

    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    position="relative"
                    overflow="auto"
                    whiteSpace="nowrap"
                    h="calc(100vh - 350px)"
                >
                    {isLoading && (
                        <Stack
                            h="100%"
                            alignItems="center"
                            justifyContent="center"
                            justifyItems="center"
                            alignContent="center"
                        >
                            <Spinner />
                        </Stack>
                    )}
                    {isLoading && <Spinner />}
                    {isSuccess && (
                        <TableDisplay<Partial<{ id: string; name: string }>>
                            generatedData={data.data}
                            columns={columns}
                            onRowClick={(id) => dataSetSelect(id)}
                            queryKey={["step2"]}
                            selected={aggregateMapping.aggregate?.dataSet}
                        />
                    )}
                    {isError && JSON.stringify(error)}
                </Box>
            </Box>

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Loading Selected DataSet"
                onOpen={onOpen}
            />
        </Stack>
    );
}
