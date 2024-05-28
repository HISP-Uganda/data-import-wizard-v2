import { Checkbox, Stack } from "@chakra-ui/react";
import { IMapping } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { ChangeEvent } from "react";
import { mappingApi } from "../../Events";
import { $mapping } from "../../Store";
import NumberProperty from "../mapping-fields/NumberProperty";

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
            </Stack>
        );

    return null;
}
