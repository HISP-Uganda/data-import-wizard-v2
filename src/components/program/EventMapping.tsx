import { Button, Flex, Stack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { useState } from "react";
import { $program } from "../../pages/program";
import ProgramStageMapping from "../ProgramStageMapping";

export default function EventMapping() {
    const program = useStore($program);
    const [active, setActive] = useState<string>(
        program.programStages?.[0].id || ""
    );
    return (
        <Stack
            spacing="30px"
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            <Flex
                gap="5px"
                flexWrap="wrap"
                bgColor="white"
                p="5px"
                alignContent="flex-start"
            >
                {program.programStages?.map(({ name, id }) => (
                    <Button
                        size="sm"
                        variant="outline"
                        key={id}
                        colorScheme={active === id ? "teal" : ""}
                        onClick={() => setActive(() => id)}
                    >
                        {name || id}
                    </Button>
                ))}
            </Flex>
            {program.programStages?.map(
                ({ id: psId, programStageDataElements, repeatable }) => {
                    return (
                        psId === active && (
                            <ProgramStageMapping
                                key={psId}
                                psId={psId}
                                repeatable={repeatable}
                                programStageDataElements={
                                    programStageDataElements
                                }
                            />
                        )
                    );
                }
            )}
        </Stack>
    );
}
