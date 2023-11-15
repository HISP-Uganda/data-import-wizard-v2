import { Stack } from "@chakra-ui/react";
import { IMapping } from "data-import-wizard-utils";
import { useStore } from "effector-react";

import {
    $aggMetadata,
    $aggregateMapping,
    aggregateMappingApi,
} from "../../pages/aggregate";
import NumberProperty from "../fields/NumberProperty";
import SelectField from "../fields/SelectProperty";

export default function Configuration() {
    const aggregateMapping = useStore($aggregateMapping);
    const aggregateMetadata = useStore($aggMetadata);

    return (
        <Stack spacing="30px">
            <NumberProperty<IMapping>
                title="Header row"
                api={aggregateMappingApi.update}
                attribute="headerRow"
                mapping={aggregateMapping}
            />
            <NumberProperty<IMapping>
                title="Data start row"
                api={aggregateMappingApi.update}
                attribute="dataStartRow"
                mapping={aggregateMapping}
            />

            <Stack>
                {/* <Checkbox
                    isChecked={aggregateMapping[value]?.specific}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSpecific(value, e.target.checked)
                    }
                /> */}
                <SelectField<IMapping>
                    title="Organisation column"
                    api={aggregateMappingApi.update}
                    attribute="orgUnitColumn"
                    mapping={aggregateMapping}
                    options={aggregateMetadata.sourceColumns}
                    multiple={false}
                />
            </Stack>

            <SelectField<IMapping>
                title="Period column"
                api={aggregateMappingApi.update}
                attribute="program"
                otherKeys="periodColumn"
                mapping={aggregateMapping}
                options={aggregateMetadata.sourceColumns}
                multiple={false}
            />

            <SelectField<IMapping>
                title="Data element column"
                api={aggregateMappingApi.update}
                attribute="aggregate"
                otherKeys="dataElementColumn"
                mapping={aggregateMapping}
                options={aggregateMetadata.sourceColumns}
                multiple={false}
            />
            <SelectField<IMapping>
                title="Category option combo column"
                api={aggregateMappingApi.update}
                attribute="aggregate"
                otherKeys="categoryOptionComboColumn"
                mapping={aggregateMapping}
                options={aggregateMetadata.sourceColumns}
                multiple={false}
            />

            <SelectField<IMapping>
                title="Attribute option combo column"
                api={aggregateMappingApi.update}
                attribute="aggregate"
                mapping={aggregateMapping}
                options={aggregateMetadata.sourceColumns}
                multiple={false}
                otherKeys="attributeOptionComboColumn"
            />
            <Stack alignItems="center" direction="row" w="100%" spacing="20px">
                {aggregateMetadata.destinationCategories.map(
                    ({ label, value }) => (
                        <SelectField<IMapping>
                            title={`${label} Column`}
                            api={aggregateMappingApi.update}
                            attribute="aggregate"
                            mapping={aggregateMapping}
                            options={aggregateMetadata.sourceColumns}
                            multiple={false}
                            otherKeys={`categoryColumns.${value}`}
                            flex={1}
                        />
                    )
                )}
            </Stack>
        </Stack>
    );
}
