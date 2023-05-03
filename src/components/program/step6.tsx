import { useStore } from "effector-react";
import { $programMapping } from "../../pages/program/Store";
import DHIS2Options from "./DHIS2Options";
import Preview from "./Preview";

const Step6 = () => {
    const programMapping = useStore($programMapping);
    return programMapping.isSource ? <DHIS2Options /> : <Preview />;
};

export default Step6;
