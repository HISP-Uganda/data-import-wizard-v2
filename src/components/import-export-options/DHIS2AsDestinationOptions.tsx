import { Checkbox, Stack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { mappingApi } from "../../Events";
import { $mapping } from "../../Store";
import NumberProperty from "../mapping-fields/NumberProperty";
import SwitchComponent, { Case } from "../SwitchComponent";

export default function DHIS2AsDestinationOptions() {
    const mapping = useStore($mapping);
    if (!mapping.isSource)
        return (
            <Stack flex={1}>
                <Checkbox
                    isChecked={mapping.dhis2DestinationOptions?.async}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        mappingApi.update({
                            attribute: "dhis2DestinationOptions",
                            path: "async",
                            value: e.target.checked,
                        })
                    }
                >
                    Asynchronous
                </Checkbox>

                <NumberProperty
                    title="Chunk Size"
                    attribute="chunkSize"
                    max={10000}
                    min={100}
                    step={50}
                />
                <SwitchComponent condition={mapping.type === "aggregate"}>
                    <Case value={true}>
                        <Checkbox
                            isChecked={
                                mapping.dhis2DestinationOptions?.completeDataSet
                            }
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                mappingApi.update({
                                    attribute: "dhis2DestinationOptions",
                                    path: "completeDataSet",
                                    value: e.target.checked,
                                })
                            }
                        >
                            Complete Data Set
                        </Checkbox>
                    </Case>
                    <Case default>{null}</Case>
                </SwitchComponent>
            </Stack>
        );

    return null;
}
