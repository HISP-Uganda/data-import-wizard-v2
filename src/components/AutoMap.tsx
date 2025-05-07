import { Checkbox, Stack, useDisclosure } from "@chakra-ui/react";
import { Mapping, Option, RealMapping } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { isEmpty } from "lodash";
import { ChangeEvent, useState } from "react";
import { CQIDexie } from "../db";
import { $mapping } from "../Store";
import { searchMapping } from "../utils/utils";
import Progress from "./Progress";

export default function AutoMap({
    destinationOptions,
    sourceOptions,
    mapped,
    onFinishSearch,
    db,
    isOrgUnitMapping,
}: {
    destinationOptions: Option[];
    sourceOptions: Option[];
    mapped: Mapping;
    onFinishSearch: (processed: Mapping) => void;
    db: CQIDexie;
    isOrgUnitMapping?: boolean;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const mapping = useStore($mapping);
    const [autoMapping, setAutoMapping] = useState<boolean>(false);

    const autoMap = async (map: boolean) => {
        const processed: Mapping = new Map<string, Partial<RealMapping>>();
        onOpen();
        try {
            await db.messages.put({
                message: "Starting automatic mapping process",
                id: 1,
            });
            const chunkSize = 50;
            for (let i = 0; i < destinationOptions.length; i += chunkSize) {
                const chunk = destinationOptions.slice(i, i + chunkSize);
                await new Promise<void>((resolve) => {
                    setTimeout(async () => {
                        for (const option of chunk) {
                            const {
                                value = "",
                                code = "",
                                label = "",
                                id = "",
                                path = "",
                            } = option;
                            const prev = mapped.get(value);
                            const search = searchMapping({
                                value,
                                label,
                                sourceOptions,
                                id,
                                mapping,
                                code,
                                path,
                                isOrgUnitMapping,
                            });
                            if (
                                map &&
                                (prev === undefined || isEmpty(prev.source)) &&
                                search !== undefined
                            ) {
                                if (
                                    isOrgUnitMapping &&
                                    mapping.orgUnitMapping?.matchHierarchy
                                ) {
                                    processed.set(value, {
                                        ...option,
                                        source: search.path,
                                    });
                                } else {
                                    processed.set(value, {
                                        ...option,
                                        source: search.value,
                                    });
                                }
                            } else if (
                                map &&
                                (prev === undefined || isEmpty(prev.source)) &&
                                search === undefined
                            ) {
                            } else if (!map && !isEmpty(prev)) {
                                processed.delete(value);
                            }
                        }
                        await db.messages.put({
                            message: `Processing ${Math.min(
                                i + chunkSize,
                                destinationOptions.length,
                            )} of ${destinationOptions.length} items`,
                            id: 1,
                        });

                        resolve();
                    }, 0);
                });
            }

            await db.messages.put({
                message: "Completing mapping process",
                id: 1,
            });

            onFinishSearch(processed);
        } catch (error) {
            console.error("Error during auto mapping:", error);
            await db.messages.put({
                message: "Error occurred during mapping",
                id: 1,
            });
        } finally {
            onClose();
        }
    };

    const handleAutoMapChange = async (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const isChecked = e.target.checked;
        setAutoMapping(isChecked);
        await autoMap(isChecked);
    };

    return (
        <Stack>
            <Checkbox onChange={handleAutoMapChange} isChecked={autoMapping}>
                Auto Map
            </Checkbox>
            <Progress onClose={onClose} isOpen={isOpen} db={db} />
        </Stack>
    );
}
