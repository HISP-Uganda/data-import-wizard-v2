import { Box, Image, Stack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { $programMapping } from "../pages/program/Store";

export const available: any = {
    xlsx: (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="/excel.svg" alt="xlsx" />
        </Stack>
    ),
    dhis2: (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="/dhis2.svg" alt="dhis2" />
        </Stack>
    ),
    api: (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="/api.svg" alt="api" />
        </Stack>
    ),
    csv: (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="/csv.svg" alt="csv" />
        </Stack>
    ),
    json: (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="/json.svg" alt="json" />
        </Stack>
    ),
    godata: (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="/godata.svg" alt="godata" />
        </Stack>
    ),
};

export default function DestinationIcon() {
    const programMapping = useStore($programMapping);

    if (programMapping.isSource) {
        return available[programMapping.dataSource || ""];
    }

    return available.dhis2;
}
