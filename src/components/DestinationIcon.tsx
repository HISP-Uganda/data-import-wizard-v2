import { Image, Stack } from "@chakra-ui/react";
import { IMapping } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import React from "react";
import { $programMapping } from "../pages/program/Store";

export const available: {
    "xlsx-line-list": React.ReactElement;
    "xlsx-tabular-data": React.ReactElement;
    "xlsx-form": React.ReactElement;
    "dhis2-program": React.ReactElement;
    "dhis2-indicators": React.ReactElement;
    "dhis2-program-indicators": React.ReactElement;
    "dhis2-data-set": React.ReactElement;
    api: React.ReactElement;
    json: React.ReactElement;
    "csv-line-list": React.ReactElement;
    "go-data": React.ReactElement;
    "manual-dhis2-program-indicators": React.ReactElement;
} = {
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
};

export default function DestinationIcon({
    mapping,
}: {
    mapping: Partial<IMapping>;
}) {
    if (mapping.isSource && mapping.dataSource) {
        return available[mapping.dataSource];
    }

    return available["dhis2-program"];
}
