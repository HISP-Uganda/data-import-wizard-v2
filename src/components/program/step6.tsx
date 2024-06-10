import { useStore } from "effector-react";
import { $mapping } from "../../Store";
import DHIS2Options from "./DHIS2Options";
import Preview from "../previews/Preview";

const Step6 = () => {
    const mapping = useStore($mapping);
    return mapping.isSource ? <DHIS2Options /> : <Preview />;
};

export default Step6;
