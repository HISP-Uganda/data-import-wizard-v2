import {
    Box,
    Button, Flex, HStack, useColorModeValue, useDisclosure
} from "@chakra-ui/react";
import {useSearch, useNavigate} from "@tanstack/react-location";
import {LocationGenerics} from "../Interfaces";

const NavBar = () =>{
    const search = useSearch<LocationGenerics>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();

    return (
        <>
            <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
                <Flex h={12} alignItems={'center'} justifyContent={'space-between'}>
                    <HStack spacing={8} alignItems={'center'}>
                        <HStack
                            as={'nav'}
                            spacing={4}
                            display={{ base: 'none', md: 'flex' }}>
                            <Button
                                fontWeight={"small"}
                                onClick={() => {
                                    navigate({to: '/program', search})
                                    }
                                }>
                                Tracker
                            </Button>
                            <Button fontWeight={"small"}
                                    onClick={() => {
                                        navigate({to: '/aggregate', search})
                                    }
                                    }>
                                Aggregate
                            </Button>
                            <Button
                                fontWeight={"small"}
                                onClick={() => {
                                    navigate({to: '/schedules', search})
                                }
                                }>
                                Schedule
                            </Button>
                            <Button fontWeight={"small"}
                                    onClick={() => {
                                        navigate({to: '/organisation', search})
                                    }
                                    }>
                                Organisation
                            </Button>
                        </HStack>
                    </HStack>
                </Flex>
            </Box>
        </>
    );
}

export default NavBar;