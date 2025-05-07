import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { useState } from "react";
import { CQIDexie } from "../../db";
import { $program } from "../../Store";
import ProgramStageMapping from "../ProgramStageMapping";

export default function EventMapping({ db }: { db: CQIDexie }) {
    const program = useStore($program);
    const [active, setActive] = useState<string>(() => {
        if (program.programStages && program.programStages.length > 0) {
            return program.programStages[0].id;
        }
        return "";
    });

    if (program.programStages && program.programStages.length === 0) {
        return (
            <Stack
                w="100%"
                h="100%"
                alignItems="center"
                justifyContent="center"
            >
                <Text color="red.500" fontSize="3xl">
                    Selected program has no stages
                </Text>
            </Stack>
        );
    }
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
                ({
                    id: psId,
                    programStageDataElements,
                    repeatable,
                    featureType,
                }) => {
                    return (
                        psId === active && (
                            <ProgramStageMapping
                                key={psId}
                                psId={psId}
                                programStageDataElements={
                                    programStageDataElements
                                }
                                featureType={featureType}
                                db={db}
                            />
                        )
                    );
                },
            )}
        </Stack>
    );
}
