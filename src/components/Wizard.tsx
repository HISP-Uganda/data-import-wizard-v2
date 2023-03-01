import React from "react";
// Chakra imports
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    Icon,
    Input,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import { useRef, useState } from "react";
import { AiFillSetting } from "react-icons/ai";
import { BsCircleFill } from "react-icons/bs";
import { FaCube } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";

function Wizard() {
    const textColor = useColorModeValue("gray.700", "white");
    const bgPrevButton = useColorModeValue("gray.100", "gray.100");
    const iconColor = useColorModeValue("gray.300", "gray.700");
    const [activeBullets, setActiveBullets] = useState({
        about: true,
        account: false,
        address: false,
    });

    const [checkboxes, setCheckboxes] = useState({
        design: false,
        code: false,
        develop: false,
    });

    const aboutTab = useRef();
    const accountTab = useRef();
    const addressTab = useRef();

    return (
        <Flex
            direction="column"
            minH="100vh"
            align="center"
            pt={{ sm: "125px", lg: "75px" }}
        >
            <Flex
                direction="column"
                textAlign="center"
                mb={{ sm: "25px", md: "45px" }}
            >
                <Text
                    color={textColor}
                    fontSize={{ sm: "2xl", md: "3xl", lg: "4xl" }}
                    fontWeight="bold"
                    mb="8px"
                >
                    Build your profile
                </Text>
                <Text
                    color="gray.400"
                    fontWeight="normal"
                    fontSize={{ sm: "sm", md: "lg" }}
                >
                    This information will let us know more about you.
                </Text>
            </Flex>
            <Tabs
                variant="unstyled"
                mt="24px"
                display="flex"
                flexDirection="column"
            >
                <TabList display="flex" alignSelf="center" justifySelf="center">
                    <Tab
                        // ref={aboutTab}
                        w={{ sm: "120px", md: "250px", lg: "300px" }}
                        onClick={() =>
                            setActiveBullets({
                                about: true,
                                account: false,
                                address: false,
                            })
                        }
                    >
                        <Flex
                            direction="column"
                            justify="center"
                            align="center"
                            position="relative"
                            _before={{
                                content: "''",
                                width: {
                                    sm: "120px",
                                    md: "250px",
                                    lg: "300px",
                                },
                                height: "3px",
                                bg: activeBullets.account
                                    ? textColor
                                    : "gray.200",
                                left: { sm: "12px", md: "26px" },
                                top: {
                                    sm: activeBullets.about ? "6px" : "4px",
                                },
                                position: "absolute",
                                bottom: activeBullets.about ? "40px" : "38px",
                                zIndex: -1,
                                transition: "all .3s ease",
                            }}
                        >
                            <Icon
                                as={BsCircleFill}
                                color={
                                    activeBullets.about ? textColor : "gray.300"
                                }
                                w={activeBullets.about ? "16px" : "12px"}
                                h={activeBullets.about ? "16px" : "12px"}
                                mb="8px"
                            />
                            <Text
                                color={
                                    activeBullets.about
                                        ? { textColor }
                                        : "gray.300"
                                }
                                fontWeight={
                                    activeBullets.about ? "bold" : "normal"
                                }
                                display={{ sm: "none", md: "block" }}
                                fontSize="sm"
                            >
                                About
                            </Text>
                        </Flex>
                    </Tab>
                    <Tab
                        // ref={accountTab}
                        w={{ sm: "120px", md: "250px", lg: "300px" }}
                        onClick={() =>
                            setActiveBullets({
                                about: true,
                                account: true,
                                address: false,
                            })
                        }
                    >
                        <Flex
                            direction="column"
                            justify="center"
                            align="center"
                            position="relative"
                            _before={{
                                content: "''",
                                width: {
                                    sm: "120px",
                                    md: "250px",
                                    lg: "300px",
                                },
                                height: "3px",
                                bg: activeBullets.address
                                    ? textColor
                                    : "gray.200",
                                left: { sm: "12px", md: "28px" },
                                top: {
                                    sm: activeBullets.account ? "6px" : "4px",
                                },
                                position: "absolute",
                                bottom: activeBullets.account ? "40px" : "38px",
                                zIndex: -1,
                                transition: "all .3s ease",
                            }}
                        >
                            <Icon
                                as={BsCircleFill}
                                color={
                                    activeBullets.account
                                        ? textColor
                                        : "gray.300"
                                }
                                w={activeBullets.account ? "16px" : "12px"}
                                h={activeBullets.account ? "16px" : "12px"}
                                mb="8px"
                            />
                            <Text
                                color={
                                    activeBullets.account
                                        ? { textColor }
                                        : "gray.300"
                                }
                                fontWeight={
                                    activeBullets.account ? "bold" : "normal"
                                }
                                transition="all .3s ease"
                                fontSize="sm"
                                _hover={{ color: textColor }}
                                display={{ sm: "none", md: "block" }}
                            >
                                Account
                            </Text>
                        </Flex>
                    </Tab>
                    <Tab
                        // ref={addressTab}
                        w={{ sm: "120px", md: "250px", lg: "300px" }}
                        onClick={() =>
                            setActiveBullets({
                                about: true,
                                account: true,
                                address: true,
                            })
                        }
                    >
                        <Flex
                            direction="column"
                            justify="center"
                            align="center"
                            position="relative"
                            _before={{
                                content: "''",
                                width: {
                                    sm: "120px",
                                    md: "250px",
                                    lg: "300px",
                                },
                                height: "3px",
                                // bg: activeBullets.profile ? textColor : "gray.200",
                                left: { sm: "12px", md: "32px" },
                                top: {
                                    sm: activeBullets.address ? "6px" : "4px",
                                },
                                position: "absolute",
                                bottom: activeBullets.address ? "40px" : "38px",
                                zIndex: -1,
                                transition: "all .3s ease",
                            }}
                        >
                            <Icon
                                as={BsCircleFill}
                                color={
                                    activeBullets.address
                                        ? textColor
                                        : "gray.300"
                                }
                                w={activeBullets.address ? "16px" : "12px"}
                                h={activeBullets.address ? "16px" : "12px"}
                                mb="8px"
                            />
                            <Text
                                color={
                                    activeBullets.address
                                        ? { textColor }
                                        : "gray.300"
                                }
                                fontWeight={
                                    activeBullets.address ? "bold" : "normal"
                                }
                                transition="all .3s ease"
                                fontSize="sm"
                                _hover={{ color: textColor }}
                                display={{ sm: "none", md: "block" }}
                            >
                                Address
                            </Text>
                        </Flex>
                    </Tab>
                </TabList>
                <TabPanels mt="24px" maxW={{ md: "90%", lg: "100%" }} mx="auto">
                    <TabPanel
                        w={{ sm: "330px", md: "700px", lg: "850px" }}
                        mx="auto"
                    >
                        <Box>
                            <Flex mb="40px">
                                <Flex
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    textAlign="center"
                                    w="80%"
                                    mx="auto"
                                >
                                    <Text
                                        color={textColor}
                                        fontSize="lg"
                                        fontWeight="bold"
                                        mb="4px"
                                    >
                                        Let's start with the basic information
                                    </Text>
                                    <Text
                                        color="gray.400"
                                        fontWeight="normal"
                                        fontSize="sm"
                                    >
                                        Let us know your name and email address.
                                        Use an address you don't mind other
                                        users contacting you at
                                    </Text>
                                </Flex>
                            </Flex>
                            <Box>
                                <Flex direction="column" w="100%">
                                    <Flex
                                        direction={{ sm: "column", md: "row" }}
                                        w="100%"
                                        mb="24px"
                                    >
                                        <Box
                                            position="relative"
                                            minW={{ sm: "110px", xl: "150px" }}
                                            h={{ sm: "110px", xl: "150px" }}
                                            mx={{
                                                sm: "auto",
                                                md: "40px",
                                                xl: "85px",
                                            }}
                                            mb={{ sm: "25px" }}
                                        >
                                            <Avatar
                                                w="100%"
                                                h="100%"
                                                borderRadius="12px"
                                            />
                                        </Box>
                                        <Stack
                                            direction="column"
                                            spacing="20px"
                                            w="100%"
                                        >
                                            <FormControl>
                                                <FormLabel
                                                    color={textColor}
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                >
                                                    First Name
                                                </FormLabel>
                                                <Input
                                                    borderRadius="15px"
                                                    placeholder="eg. Michael"
                                                    fontSize="xs"
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel
                                                    color={textColor}
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                >
                                                    Last Name
                                                </FormLabel>
                                                <Input
                                                    borderRadius="15px"
                                                    placeholder="eg. Jackson"
                                                    fontSize="xs"
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel
                                                    color={textColor}
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                >
                                                    Email Address
                                                </FormLabel>
                                                <Input
                                                    borderRadius="15px"
                                                    placeholder="eg. example@address.com"
                                                    fontSize="xs"
                                                />
                                            </FormControl>
                                        </Stack>
                                    </Flex>
                                    <Button
                                        variant="no-hover"
                                        bg="linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
                                        alignSelf="flex-end"
                                        mt="24px"
                                        w={{ sm: "75px", lg: "100px" }}
                                        h="35px"
                                        onClick={() => {
                                            // return accountTab.current.click();
                                            // return "";
                                        }}
                                    >
                                        <Text
                                            fontSize="xs"
                                            color="#fff"
                                            fontWeight="bold"
                                        >
                                            NEXT
                                        </Text>
                                    </Button>
                                </Flex>
                            </Box>
                        </Box>
                    </TabPanel>
                    <TabPanel
                        w={{ sm: "330px", md: "700px", lg: "850px" }}
                        mx="auto"
                    >
                        <Box>
                            <Flex mb="40px">
                                <Flex
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    textAlign="center"
                                    w="80%"
                                    mx="auto"
                                >
                                    <Text
                                        color={textColor}
                                        fontSize="lg"
                                        fontWeight="bold"
                                        mb="4px"
                                    >
                                        What are you doing? (checkboxes)
                                    </Text>
                                    <Text
                                        color="gray.400"
                                        fontWeight="normal"
                                        fontSize="sm"
                                    >
                                        Give us more details about you. What do
                                        you enjoy doing in your spare time?
                                    </Text>
                                </Flex>
                            </Flex>
                            <Box>
                                <Flex direction="column" w="100%">
                                    <Stack
                                        direction={{ sm: "column", md: "row" }}
                                        spacing={{ sm: "20px", lg: "35px" }}
                                        alignSelf="center"
                                        justifySelf="center"
                                        mb="24px"
                                    >
                                        <Flex direction="column" align="center">
                                            <FormLabel
                                                w="150px"
                                                h="150px"
                                                cursor="pointer"
                                                mb="16px"
                                            >
                                                <Flex
                                                    w="100%"
                                                    h="100%"
                                                    borderRadius="12px"
                                                    justify="center"
                                                    transition=".5s all ease"
                                                    border="1px solid lightgray"
                                                    align="center"
                                                    bg={
                                                        checkboxes.design
                                                            ? "teal.300"
                                                            : "#fff"
                                                    }
                                                    _hover={{ opacity: "0.8" }}
                                                >
                                                    <Checkbox
                                                        onChange={() =>
                                                            setCheckboxes(
                                                                (
                                                                    prevCheckboxes
                                                                ) => {
                                                                    return {
                                                                        ...prevCheckboxes,
                                                                        design: !prevCheckboxes.design,
                                                                    };
                                                                }
                                                            )
                                                        }
                                                        display="none"
                                                    />
                                                    <Icon
                                                        as={AiFillSetting}
                                                        w="54px"
                                                        h="54px"
                                                        color={
                                                            checkboxes.design
                                                                ? "#fff"
                                                                : iconColor
                                                        }
                                                    />
                                                </Flex>
                                            </FormLabel>
                                            <Text
                                                color={textColor}
                                                fontWeight="bold"
                                                fontSize="md"
                                            >
                                                Design
                                            </Text>
                                        </Flex>
                                        <Flex direction="column" align="center">
                                            <FormLabel
                                                w="150px"
                                                h="150px"
                                                cursor="pointer"
                                                mb="16px"
                                            >
                                                <Flex
                                                    w="100%"
                                                    h="100%"
                                                    borderRadius="12px"
                                                    justify="center"
                                                    transition=".5s all ease"
                                                    border="1px solid lightgray"
                                                    align="center"
                                                    bg={
                                                        checkboxes.code
                                                            ? "teal.300"
                                                            : "#fff"
                                                    }
                                                    _hover={{ opacity: "0.8" }}
                                                >
                                                    <Checkbox
                                                        onChange={() =>
                                                            setCheckboxes(
                                                                (
                                                                    prevCheckboxes
                                                                ) => {
                                                                    return {
                                                                        ...prevCheckboxes,
                                                                        code: !prevCheckboxes.code,
                                                                    };
                                                                }
                                                            )
                                                        }
                                                        display="none"
                                                    />
                                                    <Icon
                                                        as={FaCube}
                                                        w="54px"
                                                        h="54px"
                                                        color={
                                                            checkboxes.code
                                                                ? "#fff"
                                                                : iconColor
                                                        }
                                                    />
                                                </Flex>
                                            </FormLabel>
                                            <Text
                                                color={textColor}
                                                fontWeight="bold"
                                                fontSize="md"
                                            >
                                                Code
                                            </Text>
                                        </Flex>
                                        <Flex direction="column" align="center">
                                            <FormLabel
                                                w="150px"
                                                h="150px"
                                                cursor="pointer"
                                                mb="16px"
                                            >
                                                <Flex
                                                    w="100%"
                                                    h="100%"
                                                    borderRadius="12px"
                                                    justify="center"
                                                    transition=".5s all ease"
                                                    border="1px solid lightgray"
                                                    align="center"
                                                    bg={
                                                        checkboxes.develop
                                                            ? "teal.300"
                                                            : "#fff"
                                                    }
                                                    _hover={{ opacity: "0.8" }}
                                                >
                                                    <Checkbox
                                                        onChange={() =>
                                                            setCheckboxes(
                                                                (
                                                                    prevCheckboxes
                                                                ) => {
                                                                    return {
                                                                        ...prevCheckboxes,
                                                                        develop:
                                                                            !prevCheckboxes.develop,
                                                                    };
                                                                }
                                                            )
                                                        }
                                                        display="none"
                                                    />
                                                    <Icon
                                                        w="54px"
                                                        h="54px"
                                                        color={
                                                            checkboxes.develop
                                                                ? "#fff"
                                                                : iconColor
                                                        }
                                                    />
                                                </Flex>
                                            </FormLabel>
                                            <Text
                                                color={textColor}
                                                fontWeight="bold"
                                                fontSize="md"
                                            >
                                                Develop
                                            </Text>
                                        </Flex>
                                    </Stack>

                                    <Flex justify="space-between">
                                        <Button
                                            variant="no-hover"
                                            bg={bgPrevButton}
                                            alignSelf="flex-end"
                                            mt="24px"
                                            w={{ sm: "75px", lg: "100px" }}
                                            h="35px"
                                            onClick={() => {
                                                // return aboutTab.current.click();
                                                return "";
                                            }}
                                        >
                                            <Text
                                                fontSize="xs"
                                                color="gray.700"
                                                fontWeight="bold"
                                            >
                                                PREV
                                            </Text>
                                        </Button>
                                        <Button
                                            variant="no-hover"
                                            bg="linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
                                            alignSelf="flex-end"
                                            mt="24px"
                                            w={{ sm: "75px", lg: "100px" }}
                                            h="35px"
                                            onClick={() => {
                                                // return addressTab.current.click();
                                                return "";
                                            }}
                                        >
                                            <Text
                                                fontSize="xs"
                                                color="#fff"
                                                fontWeight="bold"
                                            >
                                                NEXT
                                            </Text>
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Box>
                        </Box>
                    </TabPanel>
                    <TabPanel
                        w={{ sm: "330px", md: "700px", lg: "850px" }}
                        mx="auto"
                    >
                        <Box>
                            <Flex mb="40px">
                                <Flex
                                    direction="column"
                                    align="center"
                                    justify="center"
                                    textAlign="center"
                                    w="80%"
                                    mx="auto"
                                >
                                    <Text
                                        color={textColor}
                                        fontSize="lg"
                                        fontWeight="bold"
                                        mb="4px"
                                    >
                                        Are you living in a nice area?
                                    </Text>
                                    <Text
                                        color="gray.400"
                                        fontWeight="normal"
                                        fontSize="sm"
                                    >
                                        One thing I love about the later sunsets
                                        is the chance to go for a walk through
                                        the neighborhood woods before dinner
                                    </Text>
                                </Flex>
                            </Flex>
                            <Box>
                                <Flex direction="column" w="100%">
                                    <Stack direction="column" spacing="20px">
                                        <FormControl>
                                            <FormLabel
                                                color={textColor}
                                                fontWeight="bold"
                                                fontSize="xs"
                                            >
                                                Address 1
                                            </FormLabel>
                                            <Input
                                                borderRadius="15px"
                                                placeholder="eg. Street 120"
                                                fontSize="xs"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel
                                                color={textColor}
                                                fontWeight="bold"
                                                fontSize="xs"
                                            >
                                                Address 2
                                            </FormLabel>
                                            <Input
                                                borderRadius="15px"
                                                placeholder="eg. Street 220"
                                                fontSize="xs"
                                            />
                                        </FormControl>
                                        <Grid
                                            templateColumns={{
                                                sm: "1fr 1fr",
                                                lg: "2fr 1fr 1fr",
                                            }}
                                            gap="30px"
                                        >
                                            <FormControl
                                                gridColumn={{
                                                    sm: "1 / 3",
                                                    lg: "auto",
                                                }}
                                            >
                                                <FormLabel
                                                    color={textColor}
                                                    fontWeight="bold"
                                                    fontSize="xs"
                                                >
                                                    City
                                                </FormLabel>
                                                <Input
                                                    borderRadius="15px"
                                                    placeholder="eg. Tokyo"
                                                    fontSize="xs"
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel
                                                    color={textColor}
                                                    fontWeight="bold"
                                                    fontSize="xs"
                                                >
                                                    State
                                                </FormLabel>
                                                <Input
                                                    borderRadius="15px"
                                                    placeholder="..."
                                                    fontSize="xs"
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel
                                                    color={textColor}
                                                    fontWeight="bold"
                                                    fontSize="xs"
                                                >
                                                    ZIP
                                                </FormLabel>
                                                <Input
                                                    borderRadius="15px"
                                                    placeholder="7 letters"
                                                    fontSize="xs"
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Stack>
                                    <Flex justify="space-between">
                                        <Button
                                            variant="no-hover"
                                            bg={bgPrevButton}
                                            alignSelf="flex-end"
                                            mt="24px"
                                            w={{ sm: "75px", lg: "100px" }}
                                            h="35px"
                                            onClick={() => {
                                                // return accountTab.current.click();
                                                return "";
                                            }}
                                        >
                                            <Text
                                                fontSize="xs"
                                                color="gray.700"
                                                fontWeight="bold"
                                            >
                                                PREV
                                            </Text>
                                        </Button>
                                        <Button
                                            variant="no-hover"
                                            bg="linear-gradient(81.62deg, #313860 2.25%, #151928 79.87%)"
                                            alignSelf="flex-end"
                                            mt="24px"
                                            w={{ sm: "75px", lg: "100px" }}
                                            h="35px"
                                        >
                                            <Text
                                                fontSize="xs"
                                                color="#fff"
                                                fontWeight="bold"
                                            >
                                                SEND
                                            </Text>
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Box>
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Flex>
    );
}

export default Wizard;
