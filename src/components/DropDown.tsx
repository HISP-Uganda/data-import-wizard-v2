import { GroupBase, Select } from "chakra-react-select";

export default function DropDown<T>({
    list,
    labelKey,
    valueKey,
    value,
    onChange,
}: {
    list: T[];
    labelKey: keyof T;
    valueKey: keyof T;
    value: string | undefined;
    onChange: (value: T | null) => void;
}) {
    const currentValue = list.find((l) => l[valueKey] === value);
    return (
        <Select<T, false, GroupBase<T>>
            value={currentValue}
            options={list}
            isClearable
            placeholder="Select tracked entity column"
            getOptionLabel={(option: T) => String(option[labelKey])}
            getOptionValue={(option: T) => String(option[valueKey])}
            onChange={(e) => onChange(e)}
        />
    );
}
