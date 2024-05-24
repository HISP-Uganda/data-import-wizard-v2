import { useStore } from "effector-react";
import { $mapping } from "../Store";
import AggImportSummary from "./aggregate/AggImportSummary";
import ProgramImportSummary from "./program/ProgramImportSummary";
import SwitchComponent, { Case } from "./SwitchComponent";
export default function DataImportSummary() {
    const mapping = useStore($mapping);

    return (
        <SwitchComponent condition={mapping.type}>
            <Case value="aggregate">
                <AggImportSummary />
            </Case>
            <Case default>
                <ProgramImportSummary />
            </Case>
        </SwitchComponent>
    );
}
