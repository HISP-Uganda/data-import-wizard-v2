import React, { useState, useEffect } from "react";

import {
    Spinner,
    Text,
    Stack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from "@chakra-ui/react";
import { processData } from "../../pages/program/utils";
import { useStore } from "effector-react";
import {
    $programMapping,
    $programStageMapping,
    $organisationUnitMapping,
    $attributeMapping,
    $processed,
    $data,
} from "../../pages/program/Store";

const Step6 = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const programMapping = useStore($programMapping);
    const programStageMapping = useStore($programStageMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const attributeMapping = useStore($attributeMapping);
    const processed = useStore($processed);
    const data = useStore($data);

    useEffect(() => {
        setLoading(() => true);
        processData(
            data,
            programMapping,
            organisationUnitMapping,
            attributeMapping,
            programStageMapping
        );
        setLoading(() => false);
        return () => {};
    }, []);

    return loading ? (
        <Spinner />
    ) : (
        <Tabs>
            <TabList>
                <Tab>New Entities</Tab>
                <Tab>New Enrollments</Tab>
                <Tab>New Events</Tab>
                <Tab>Entity Updates</Tab>
                <Tab>Events Updates</Tab>
                <Tab>Conflicts</Tab>
                <Tab>Errors</Tab>
                <Tab>Duplicates</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                    <Stack direction="row">
                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Value</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {processed.trackedEntityInstances?.map(
                                    (value, index) => (
                                        <Tr key={index} borderColor="green.100">
                                            <Td w="400px">
                                                {value.trackedEntityInstance}
                                            </Td>
                                        </Tr>
                                    )
                                )}
                            </Tbody>
                        </Table>
                        <pre>{JSON.stringify(processed, null, 2)}</pre>
                    </Stack>
                </TabPanel>
                <TabPanel>2</TabPanel>
                <TabPanel>3</TabPanel>
                <TabPanel>4</TabPanel>
                <TabPanel>5</TabPanel>
                <TabPanel>6</TabPanel>
                <TabPanel>7</TabPanel>
                <TabPanel>8</TabPanel>
            </TabPanels>
        </Tabs>
    );
};

export default Step6;
