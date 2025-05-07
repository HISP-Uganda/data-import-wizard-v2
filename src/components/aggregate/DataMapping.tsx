import { useStore } from "effector-react";

import { CQIDexie } from "../../db";
import { attributeMappingApi } from "../../Events";
import { $attributeMapping, $metadata } from "../../Store";
import GenericMapping from "../GenericMapping";

const DataMapping = ({ db }: { db: CQIDexie }) => {
    const metadata = useStore($metadata);
    const attributeMapping = useStore($attributeMapping);
    return (
        <GenericMapping
            destinationOptions={metadata.destinationColumns}
            sourceOptions={metadata.sourceColumns}
            mapped={attributeMapping}
            updater={attributeMappingApi.updateMany}
            db={db}
            merger={attributeMappingApi.merge}
        />
    );
};

export default DataMapping;
