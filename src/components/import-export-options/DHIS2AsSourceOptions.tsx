import { Checkbox, Stack, Text, Box } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { mappingApi } from "../../Events";
import { $mapping, $metadata } from "../../Store";
import OUTree from "../OuTree";
import PeriodPicker from "../PeriodPicker";
import SwitchComponent, { Case } from "../SwitchComponent";
import { getOr } from "lodash/fp";
export default function DHIS2AsSourceOptions() {
    const mapping = useStore($mapping);
    const metadata = useStore($metadata);

    return (
        <Stack flex={1}>
            <Stack spacing="20px">
                <Checkbox
                    isChecked={getOr(false, "prefetch", mapping)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        mappingApi.update({
                            attribute: "prefetch",
                            value: e.target.checked,
                        })
                    }
                >
                    Preview
                </Checkbox>
            </Stack>
            <Stack>
                <Text>Period</Text>
                <PeriodPicker
                    selectedPeriods={mapping.dhis2SourceOptions?.period ?? []}
                    disabled={
                        mapping.dataSource === "dhis2-data-set"
                            ? [0]
                            : undefined
                    }
                    active={
                        mapping.dataSource === "dhis2-data-set" ? 1 : undefined
                    }
                    onChange={(periods) =>
                        mappingApi.update({
                            attribute: "dhis2SourceOptions",
                            path: "period",
                            value: periods,
                        })
                    }
                />
            </Stack>
            <Stack>
                <Text>Organisation</Text>
                <OUTree
                    value={mapping.dhis2SourceOptions?.ous ?? []}
                    onChange={(ous) =>
                        mappingApi.update({
                            attribute: "dhis2SourceOptions",
                            path: "ous",
                            value: ous,
                        })
                    }
                />
            </Stack>
            <SwitchComponent condition={mapping.dataSource}>
                <Case value="dhis2-program">
                    <Stack>
                        <Text>Specific program stage</Text>
                        <Box>
                            <Select<Option, true, GroupBase<Option>>
                                options={metadata.sourceStages}
                                isClearable
                                isMulti
                                value={metadata.sourceStages.filter((value) => {
                                    const available =
                                        mapping.dhis2SourceOptions
                                            ?.programStage ?? [];
                                    return (
                                        available.indexOf(value?.value!) !== -1
                                    );
                                })}
                                onChange={(e) =>
                                    mappingApi.update({
                                        attribute: "dhis2SourceOptions",
                                        path: "programStage",
                                        value: e.map((ee) => ee.value),
                                    })
                                }
                            />
                        </Box>
                    </Stack>
                </Case>
                <Case default>{null}</Case>
            </SwitchComponent>
            {/* <Checkbox
                isChecked={mapping.dhis2SourceOptions?.useAnalytics}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    mappingApi.update({
                        attribute: "dhis2SourceOptions",
                        path: "useAnalytics",
                        value: e.target.checked,
                    })
                }
            >
                Use Analytics Aggregate
            </Checkbox> */}
        </Stack>
    );
}
