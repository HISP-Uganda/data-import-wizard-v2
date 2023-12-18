import { SearchIcon } from "@chakra-ui/icons";
import {
    Box,
    Checkbox,
    Input,
    InputGroup,
    InputLeftElement,
    Spacer,
    Stack,
} from "@chakra-ui/react";
import { Mapping, Option } from "data-import-wizard-utils";
import { ChangeEvent, useEffect, useState } from "react";
export default function Search({
    mapping,
    action,
    options,
    setSearchString,
    searchString,
    label,
    label2,
    placeholder,
}: {
    mapping: Mapping;
    options: Option[];
    action: React.Dispatch<React.SetStateAction<Option[]>>;
    setSearchString: React.Dispatch<React.SetStateAction<string>>;
    searchString: string;
    placeholder: string;
    label: string;
    label2: string;
}) {
    const [includeMapped, setIncludeMapped] = useState<boolean>(false);
    const [includeUnmapped, setIncludeUnmapped] = useState<boolean>(false);
    const filterUnits = () => {
        const mapped = Object.keys(mapping);
        action(() =>
            options.filter(({ value }) => mapped.indexOf(value ?? "") !== -1)
        );
    };
    const filterUnmapped = () => {
        const mapped = Object.keys(mapping);
        action(() =>
            options.filter(({ value }) => mapped.indexOf(value ?? "") === -1)
        );
    };

    const searchOus = (search: string) => {
        setSearchString(() => search);
        action(() =>
            options.filter(({ value, label }) =>
                label.toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    useEffect(() => {
        if (includeMapped && !includeUnmapped) {
            filterUnits();
        } else if (!includeMapped && includeUnmapped) {
            filterUnmapped();
        } else {
            action(() => options);
        }
        return () => {};
    }, [includeMapped, includeUnmapped]);

    return (
        <Stack direction="row">
            <Checkbox
                isChecked={includeMapped}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    e.persist();
                    setIncludeMapped(() => e.target.checked);
                }}
            >
                {label}
            </Checkbox>
            <Checkbox
                isChecked={includeUnmapped}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    e.persist();
                    setIncludeUnmapped(() => e.target.checked);
                }}
            >
                {label2}
            </Checkbox>
            <Spacer />
            <Box w="35%">
                <InputGroup>
                    <InputLeftElement>
                        <SearchIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                        placeholder={placeholder}
                        value={searchString}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            searchOus(e.target.value)
                        }
                    />
                </InputGroup>
            </Box>
        </Stack>
    );
}
