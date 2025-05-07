import { useStore } from "effector-react";
import { CQIDexie } from "../db";
import { $mapping } from "../Store";
import AggregateDataPreview from "./previews/AggregateDataPreview";
import ProgramDataPreview from "./previews/ProgramDataPreview";
import SwitchComponent, { Case } from "./SwitchComponent";

export default function DataPreview({ db }: { db: CQIDexie }) {
    const mapping = useStore($mapping);
    return (
        <SwitchComponent condition={mapping.type}>
            <Case value="aggregate">
                <AggregateDataPreview db={db} />
            </Case>
            <Case default>
                <ProgramDataPreview db={db} />
            </Case>
        </SwitchComponent>
    );
}
