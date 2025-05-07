import { Image, SimpleGrid, Spacer, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useSearch } from "@tanstack/react-location";
import { LocationGenerics } from "../Interfaces";

interface FeatureProps {
    title: string;
    text: string;
    icon: string;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
    const navigate = useNavigate<LocationGenerics>();

    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            h="150px"
            spacing="2px"
            borderRadius="10px"
            boxShadow="md"
            borderColor="gray.300"
            borderStyle="solid"
            borderWidth="1px"
            onClick={() => navigate({ to: "/mappings" })}
            cursor="pointer"
        >
            <Image src={icon} alt="godata" w="50px" h="50px" />
            <Text textTransform="uppercase" fontSize="18px">
                {title}
            </Text>
            <Text letterSpacing="wider">{text}</Text>
        </Stack>
    );
};
export default function Home() {
    return (
        <Stack h="calc(100vh - 48px - 48px)">
            <Stack p="40px" spacing="30px">
                <Stack p="30px" alignContent="center" spacing="20px">
                    <Text
                        fontSize="1.3em"
                        textAlign="justify"
                        fontWeight="bold"
                    >
                        Welcome to Import Wizard, your all-in-one data import
                        solution!
                    </Text>
                    <Text fontSize="1em" textAlign="justify">
                        Efficiently pull data from JSON, API, Excel, CSV, DHIS2,
                        and Go.Data with our easy mapping tool. Save your
                        mappings to automate future imports on your schedule.
                        Whether you're updating tracker/event programs or
                        aggregate data, Import Wizard streamlines the process,
                        saving you time and hassle.
                    </Text>
                    <Text fontSize="1em" textAlign="justify">
                        Get started and transform data management into a simple,
                        scheduled, and systematic process. Welcome to seamless
                        integration!
                    </Text>
                </Stack>
                <SimpleGrid columns={3} spacing="30px">
                    <Feature
                        title="Individual data import"
                        icon="./personal-data.png"
                        text="Import/Export data for tracker or event program"
                    />

                    <Feature
                        title="Aggregate Data Import"
                        icon="./numeric.png"
                        text="Import DHIS2 aggregate data"
                    />

                    <Feature
                        title="Scheduling Imports"
                        icon="./schedule.png"
                        text="Schedule created mappings"
                    />

                    <Feature
                        title="Metadata import"
                        icon="./metadata.png"
                        text="Import DHIS2 metadata from another instance"
                    />

                    <Feature
                        title="Organisation Units Import"
                        icon="./organization.png"
                        text="Import Organisation Units to DHIS2"
                    />

                    <Feature
                        title=" Users import"
                        icon="./group.png"
                        text="Import DHIS2 users"
                    />
                </SimpleGrid>
            </Stack>

            <Spacer />
            <Text textAlign="center" textTransform="uppercase" opacity={0.5}>
                Supported Data Sources
            </Text>
            <SimpleGrid
                columns={7}
                w="100%"
                h="60px"
                bg="gray.100"
                alignItems="center"
            >
                <Stack justifyContent="center" alignItems="center">
                    <Image src="./go.data.png" alt="godata" h="32px" />
                </Stack>
                <Stack justifyContent="center" alignItems="center">
                    <Image src="./dhis2-text.svg" alt="godata" h="32px" />
                </Stack>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                >
                    <Image src="./excel.svg" alt="godata" h="32px" />
                    <Text fontSize="24px" fontWeight="bold">
                        EXCEL
                    </Text>
                </Stack>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                >
                    <Image src="./browser.png" alt="godata" h="32px" />
                    <Text fontSize="24px" fontWeight="bold">
                        API
                    </Text>
                </Stack>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                >
                    <Image src="./json.png" alt="godata" h="32px" />
                    <Text fontSize="24px" fontWeight="bold">
                        JSON
                    </Text>
                </Stack>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                >
                    <Image src="./csv.png" alt="godata" h="32px" />
                    <Text fontSize="24px" fontWeight="bold">
                        CSV
                    </Text>
                </Stack>
                <Stack justifyContent="center" alignItems="center">
                    <Text fontSize="24px" fontWeight="bold">
                        + MORE
                    </Text>
                </Stack>
            </SimpleGrid>
        </Stack>
    );
}
