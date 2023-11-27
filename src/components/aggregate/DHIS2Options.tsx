import { Stack, Checkbox, Text } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import React, { ChangeEvent } from "react";
import { $aggregateMapping, aggregateMappingApi } from "../../pages/aggregate";
import { $ous, $periods, ousApi, periodsApi } from "../../Store";
import OUTree from "../OuTree";
import PeriodPicker from "../PeriodPicker";

export default function DHIS2Options() {
    const aggregateMapping = useStore($aggregateMapping);
    const periods = useStore($periods);
    const ous = useStore($ous);
    return (
        <Stack>
            <Stack direction="row" spacing="30px" alignItems="center">
                <Checkbox
                    isChecked={getOr(false, "prefetch", aggregateMapping)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        aggregateMappingApi.update({
                            attribute: "prefetch",
                            value: e.target.checked,
                        })
                    }
                >
                    Prefetch
                </Checkbox>
                <Checkbox
                // isChecked={getOr(false, "prefetch", aggregateMapping)}
                // onChange={(e: ChangeEvent<HTMLInputElement>) =>
                //     aggregateMappingApi.update({
                //         attribute: "prefetch",
                //         value: e.target.checked,
                //     })
                // }
                >
                    Use Analytics Aggregate
                </Checkbox>
            </Stack>
            <Stack direction="row" spacing="40px">
                <Stack>
                    <Text>Period</Text>
                    <PeriodPicker
                        selectedPeriods={
                            aggregateMapping.dhis2Options?.period ?? []
                        }
                        onChange={(periods) =>
                            aggregateMappingApi.update({
                                attribute: "dhis2Options",
                                key: "period",
                                value: periods,
                            })
                        }
                    />
                </Stack>
                <Stack>
                    <Text>Organisation</Text>
                    <OUTree
                        value={aggregateMapping.dhis2Options?.ous ?? []}
                        onChange={(ous) =>
                            aggregateMappingApi.update({
                                attribute: "dhis2Options",
                                key: "ous",
                                value: ous,
                            })
                        }
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}
