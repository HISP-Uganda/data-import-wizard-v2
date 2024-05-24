import { useStore } from "effector-react";
import { $mapping } from "../Store";
import AggregateDataPreview from "./previews/AggregateDataPreview";
import TrackerDataPreview from "./previews/TrackerDataPreview";
import SwitchComponent, { Case } from "./SwitchComponent";

export default function DataPreview() {
    const mapping = useStore($mapping);
    return (
        <SwitchComponent condition={mapping.type}>
            <Case value="aggregate">
                <SwitchComponent condition={mapping.isSource}>
                    <Case value={true}>No source Required</Case>
                    <Case default>
                        <AggregateDataPreview />
                    </Case>
                </SwitchComponent>
            </Case>
            <Case default>
                <SwitchComponent condition={mapping.isSource}>
                    <Case value={true}>No source Required</Case>
                    <Case default>
                        <TrackerDataPreview />
                    </Case>
                </SwitchComponent>
            </Case>
        </SwitchComponent>
    );
}
