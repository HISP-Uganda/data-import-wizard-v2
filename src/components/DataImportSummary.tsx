import { useStore } from "effector-react";
import { CQIDexie } from "../db";
import { $mapping } from "../Store";
import AggImportSummary from "./aggregate/AggImportSummary";
import ProgramImportSummary from "./program/ProgramImportSummary";
import SwitchComponent, { Case } from "./SwitchComponent";
export default function DataImportSummary({ db }: { db: CQIDexie }) {
    const mapping = useStore($mapping);

    return (
        <SwitchComponent condition={mapping.type}>
            <Case value="aggregate">
                <AggImportSummary db={db} />
            </Case>
            <Case default>
                <ProgramImportSummary db={db} />
            </Case>
        </SwitchComponent>
    );
}
