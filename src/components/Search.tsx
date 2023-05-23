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
import { ChangeEvent } from "react";
export default function Search({
    mapping,
    action,
    options,
    setCurrentPage,
    setSearchString,
    searchString,
    label,
    placeholder,
}: {
    mapping: Mapping;
    options: Option[];
    action: React.Dispatch<React.SetStateAction<Option[]>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setSearchString: React.Dispatch<React.SetStateAction<string>>;
    searchString: string;
    placeholder: string;
    label: string;
}) {
    const filterUnits = (checked: boolean) => {
        const mapped = Object.keys(mapping);
        if (checked) {
            action(() =>
                options.filter(({ value }) => mapped.indexOf(value) !== -1)
            );
            setCurrentPage(1);
        } else {
            action(() => options);
        }
    };

    const searchOus = (search: string) => {
        setSearchString(() => search);
        action(() =>
            options.filter(({ value, label }) =>
                label.toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    return (
        <Stack direction="row">
            <Checkbox
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    filterUnits(e.target.checked)
                }
            >
                {label}
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
