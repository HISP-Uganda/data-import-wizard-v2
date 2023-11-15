import { convertToAggregate } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import React, { useEffect } from "react";
import { $aggregateMapping } from "../../pages/aggregate";
import {
    $attributeMapping,
    $data,
    $organisationUnitMapping,
} from "../../pages/program";

export default function Preview() {
    const aggregateMapping = useStore($aggregateMapping);
    const ouMapping = useStore($organisationUnitMapping);
    const dataMapping = useStore($attributeMapping);
    const data = useStore($data);
    useEffect(() => {
        const processedData = convertToAggregate({
            mapping: aggregateMapping,
            ouMapping,
            dataMapping,
            data,
        });
        return () => {};
    }, []);

    return <div>Preview</div>;
}
