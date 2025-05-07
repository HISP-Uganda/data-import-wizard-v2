import { Image, Stack } from "@chakra-ui/react";
import { DataSource, IMapping } from "data-import-wizard-utils";
import React from "react";

export const available: Record<DataSource, React.ReactElement> = {
    "xlsx-line-list": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./excel.svg" alt="xlsx" />
        </Stack>
    ),
    "xlsx-tabular-data": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./excel.svg" alt="xlsx" />
        </Stack>
    ),
    "xlsx-form": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./excel.svg" alt="xlsx" />
        </Stack>
    ),
    "dhis2-program": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./dhis2.svg" alt="dhis2" />
        </Stack>
    ),
    "dhis2-indicators": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./dhis2.svg" alt="dhis2" />
        </Stack>
    ),
    "dhis2-program-indicators": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./dhis2.svg" alt="dhis2" />
        </Stack>
    ),
    "dhis2-data-set": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./dhis2.svg" alt="dhis2" />
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
            <Image src="./api.svg" alt="api" />
        </Stack>
    ),
    "csv-line-list": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./csv.svg" alt="csv" />
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
            <Image src="./json.svg" alt="json" />
        </Stack>
    ),
    "go-data": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./godata.svg" alt="godata" />
        </Stack>
    ),
    "manual-dhis2-program-indicators": (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./dhis2.svg" alt="dhis2" />
        </Stack>
    ),
    fhir: (
        <Stack
            boxSize="25px"
            alignItems="center"
            justifyContent="center"
            p="0"
            m="0"
        >
            <Image src="./dhis2.svg" alt="dhis2" />
        </Stack>
    ),
};

export default function DestinationIcon({
    mapping,
}: {
    mapping: Partial<IMapping>;
}) {
    if (mapping && mapping.isSource && mapping.dataSource) {
        return available[mapping.dataSource];
    }

    return available["dhis2-program"];
}
