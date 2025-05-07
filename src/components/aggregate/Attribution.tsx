import { Checkbox, Stack, Text } from "@chakra-ui/react";
import { Select } from "antd";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { CQIDexie } from "../../db";
import { attributionMappingApi, mappingApi } from "../../Events";
import { $attributionMapping, $mapping, $metadata } from "../../Store";
import GenericMapping from "../GenericMapping";

export default function Attribution({ db }: { db: CQIDexie }) {
    const metadata = useStore($metadata);
    const attributionMapping = useStore($attributionMapping);
    const mapping = useStore($mapping);
    const { attributionMerged } = mapping;

    return (
        <Stack>
            <Stack>
                <Checkbox
                    isChecked={attributionMerged}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        mappingApi.updateMany({
                            attributionMerged: e.target.checked,
                        });
                    }}
                >
                    Attribution Merged
                </Checkbox>
                {attributionMerged ? (
                    <Select
                        value={mapping.attributeOptionComboColumn}
                        onChange={(e) => {
                            mappingApi.updateMany({
                                attributeOptionComboColumn: e,
                            });
                        }}
                        options={metadata.sourceColumns}
                        allowClear
                    />
                ) : (
                    <Stack direction="row" w="100%">
                        {metadata.destinationCategories.map(({ label, id }) => {
                            return (
                                <Stack spacing="2px" w="100%">
                                    <Text>{`${label} Column`}</Text>
                                    <Select
                                        value={
                                            metadata.sourceColumns.find(
                                                (pt) =>
                                                    pt.value ===
                                                    mapping.categoryColumns?.get(
                                                        id ?? "",
                                                    ),
                                            )?.value
                                        }
                                        onChange={(e) =>
                                            mappingApi.updateMany({
                                                categoryColumns:
                                                    mapping.categoryColumns?.set(
                                                        "id",
                                                        e,
                                                    ),
                                            })
                                        }
                                        options={metadata.sourceColumns}
                                        allowClear
                                    />
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
            <GenericMapping
                destinationOptions={metadata.destinationCategoryOptionCombos}
                sourceOptions={metadata.sourceCategoryOptionCombos}
                updater={attributionMappingApi.updateMany}
                merger={attributionMappingApi.merge}
                mapped={attributionMapping}
                db={db}
            />
        </Stack>
    );
}
