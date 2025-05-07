import { Stack } from "@chakra-ui/react";
import { useStore } from "effector-react";
import { CQIDexie } from "../../db";
import { enrollmentMappingApi } from "../../Events";
import { $enrollmentMapping, $metadata } from "../../Store";
import GenericMapping from "../GenericMapping";

export default function EnrollmentMapping({ db }: { db: CQIDexie }) {
    const enrollmentMapping = useStore($enrollmentMapping);
    const metadata = useStore($metadata);

    return (
        <Stack
            h="calc(100vh - 340px)"
            maxH="calc(100vh - 340px)"
            overflow="auto"
            spacing="25px"
        >
            <GenericMapping
                destinationOptions={metadata.destinationEnrollmentAttributes}
                sourceOptions={metadata.sourceColumns}
                mapped={enrollmentMapping}
                updater={enrollmentMappingApi.updateMany}
                db={db}
                merger={enrollmentMappingApi.merge}
            />
        </Stack>
    );
}
