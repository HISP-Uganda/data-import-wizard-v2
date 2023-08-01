import React, {ReactElement} from "react";
import {FcInfo, FcOrganization, FcDocument, FcOvertime, FcMultipleInputs, FcSurvey} from 'react-icons/fc'

import {Box, SimpleGrid, Icon, Text, Stack, Flex, Link, Image} from '@chakra-ui/react'
import {useNavigate, useSearch} from "@tanstack/react-location";

interface FeatureProps {
    title: string
    text: string
    icon: ReactElement
}

const Feature = ({ title, text, icon }: FeatureProps) => {
    return (
        <Stack>
            <Flex
                w={16}
                h={16}
                align={'center'}
                justify={'center'}
                color={'white'}
                rounded={'full'}
                bg={'gray.100'}
                mb={1}>
                <Link>
                    {icon}
                </Link>
            </Flex>
            <Text fontWeight={600}>{title}</Text>
            <Text color={'gray.600'}>{text}</Text>
        </Stack>
    )
}
export default function Home() {

    const search = useSearch();
    const navigate = useNavigate();
    return (
        <>
            <Box p={4}>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                    <Feature
                        icon={<Icon as={FcInfo} w={10} h={10} onClick={() => {
                            navigate({
                                to: "#",
                                search
                            })}}/>}
                        title={'Overview'}
                        text={
                            'The import wizard helps you to import data from various sources such as JSON, API, Excel, CSV, DHIS2, Go.Data ' +
                            'by letting you do a mapping on the data before importing it. You can use saved mapping to schedule the data import ' +
                            'at preferred intervals. It supports importing to a tracker/event program, as well as aggregate data'

                        }
                    />
                    <Feature
                        icon={<Icon as={FcSurvey} w={10} h={10} onClick={() => {
                            navigate({
                                to: "/tracker",
                                search
                            })}} />}
                        title={'Program'}
                        text={
                            'Import data into a tracker or event program'
                        }
                    />
                    <Feature
                        icon={<Icon as={FcMultipleInputs} w={10} h={10} onClick={() => {
                            navigate({
                                to: "/aggregate",
                                search
                            })}} />}
                        title={'Aggregate'}
                        text={
                            'Importing aggregate data'
                        }
                    />
                    <Feature
                        icon={<Icon as={FcOvertime} w={10} h={10} onClick={() => {
                            navigate({
                            to: "/schedules",
                            search
                        })}} />}
                        title={'Schedule'}
                        text={
                            'Schedule data import from saved mappings'
                        }
                    />
                    <Feature
                        icon={<Icon as={FcOrganization} w={10} h={10} onClick={() => {
                            navigate({
                                to: "/organisation",
                                search
                            })}} />}
                        title={'Organisation'}
                        text={
                            'Mapping organisation units from a given source to those in the DHIS2 instance'
                        }
                    />
                    <Feature
                        icon={<Icon as={FcDocument} w={10} h={10} onClick={() => {
                            navigate({
                                to: "/docs",
                                search
                            })}} />}
                        title={'Documentation'}
                        text={
                            'The application documentation'
                        }
                    />
                    <Feature
                        icon={<Image src="/godata.svg" alt="godata"  w={10} h={10} onClick={() => {
                            navigate({
                                to: "/program",
                                search
                            })}} />}
                        title={'Go.Data Integration'}
                        text={
                            'Go to the Program page'
                        }
                    />
                </SimpleGrid>
            </Box>

        </>
    );
}
