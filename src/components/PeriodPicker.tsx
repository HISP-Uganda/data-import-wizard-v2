import {
    IconButton,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
} from "@chakra-ui/react";
import { generateFixedPeriods } from "@dhis2/multi-calendar-dates";
import { DatePicker } from "antd";
import { GroupBase, Select } from "chakra-react-select";
import {
    createOptions2,
    FixedPeriod,
    fixedPeriods,
    FixedPeriodType,
    Option,
    Period,
    PickerProps,
    relativePeriods,
    RelativePeriodType,
} from "data-import-wizard-utils";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";
import {} from "../utils/utils";
const { RangePicker } = DatePicker;

const rangePresets: {
    label: string;
    value: [Dayjs, Dayjs];
}[] = [
    { label: "Last 7 Days", value: [dayjs().add(-7, "d"), dayjs()] },
    { label: "Last 14 Days", value: [dayjs().add(-14, "d"), dayjs()] },
    { label: "Last 30 Days", value: [dayjs().add(-30, "d"), dayjs()] },
    { label: "Last 90 Days", value: [dayjs().add(-90, "d"), dayjs()] },
];

const relativePeriodTypeOptions = createOptions2(
    [
        "Days",
        "Weeks",
        "Bi-Weeks",
        "Months",
        "Bi-Months",
        "Quarters",
        "Six-Months",
        "Financial-Years",
        "Years",
    ],
    Object.keys(relativePeriods)
);

const fixedPeriodTypeOptions = createOptions2(
    [
        "Daily",
        "Weekly",
        "Weekly (Start Wednesday)",
        "Weekly (Start Thursday)",
        "Weekly (Start Saturday)",
        "Weekly (Start Sunday)",
        "Bi-Weekly",
        "Monthly",
        "Bi-Monthly",
        "Quarterly",
        "Quarterly-Nov",
        "Six-Monthly",
        "Six-Monthly-April",
        "Six-Monthly-Nov",
        "Yearly",
        "Financial-Year (Start November)",
        "Financial-Year (Start October)",
        "Financial-Year (Start July)",
        "Financial-Year (Start April)",
    ],
    fixedPeriods
);

const PeriodPicker = ({
    selectedPeriods,
    onChange,
    disabled = [],
    active = 0,
}: PickerProps) => {
    const onRangeChange = (
        dates: null | (Dayjs | null)[],
        dateStrings: string[]
    ) => {
        if (dates) {
            onChange(
                [
                    {
                        label: `From: ${dateStrings[0]} , to: ${dateStrings[1]}`,
                        value: undefined,
                        type: "range",
                        startDate: dateStrings[0],
                        endDate: dateStrings[1],
                    },
                ],
                false
            );
        } else {
            console.log("Clear");
        }
    };
    const [relativePeriodType, setRelativePeriodType] =
        useState<RelativePeriodType>("MONTHLY");
    const [fixedPeriodType, setFixedPeriodType] =
        useState<FixedPeriodType>("MONTHLY");
    const availableRelativePeriods = relativePeriods[relativePeriodType].filter(
        ({ value }: Option) => {
            return !selectedPeriods.find(({ value: val }) => val === value);
        }
    );
    const [availableFixedPeriods, setAvailableFixedPeriods] = useState<
        Array<FixedPeriod>
    >([]);
    const [tabIndex, setTabIndex] = useState<number>(active);
    const [year, setYear] = useState<number>(dayjs().year());

    useEffect(() => {
        setAvailableFixedPeriods(
            generateFixedPeriods({
                year,
                calendar: "iso8601",
                periodType: fixedPeriodType,
                locale: "en",
            }).filter(
                ({ id }) => !selectedPeriods.find(({ value }) => value === id)
            )
        );
    }, [fixedPeriodType, year, selectedPeriods]);

    return (
        <Stack direction="row" p="2px" w="100%">
            <Stack
                flex={1}
                borderColor="gray.200"
                borderStyle="solid"
                borderWidth="1px"
            >
                <Tabs onChange={(index) => setTabIndex(index)} index={tabIndex}>
                    <TabList>
                        <Tab isDisabled={disabled.indexOf(0) !== -1}>
                            Relative Periods
                        </Tab>
                        <Tab isDisabled={disabled.indexOf(1) !== -1}>
                            Fixed Periods
                        </Tab>
                        <Tab isDisabled={disabled.indexOf(2) !== -1}>
                            Date Range
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Stack spacing="20px">
                                <Stack>
                                    <Text>Period Type</Text>
                                    <Select<Option, false, GroupBase<Option>>
                                        isClearable
                                        onChange={(e) =>
                                            setRelativePeriodType(
                                                () =>
                                                    (e?.value as RelativePeriodType) ||
                                                    "MONTHLY"
                                            )
                                        }
                                        value={relativePeriodTypeOptions.find(
                                            ({ value }) =>
                                                value === relativePeriodType
                                        )}
                                        options={relativePeriodTypeOptions}
                                        size="sm"
                                    />
                                </Stack>
                                <Stack>
                                    {availableRelativePeriods.map(
                                        ({ label, value }) => (
                                            <Text
                                                key={value}
                                                cursor="pointer"
                                                onClick={() =>
                                                    onChange(
                                                        [
                                                            ...selectedPeriods,
                                                            {
                                                                label,
                                                                value,
                                                                type: "relative",
                                                            },
                                                        ],
                                                        false
                                                    )
                                                }
                                            >
                                                {label}
                                            </Text>
                                        )
                                    )}
                                </Stack>
                            </Stack>
                        </TabPanel>
                        <TabPanel>
                            <Stack>
                                <Stack direction="row">
                                    <Stack flex={1}>
                                        <Text>Period Type</Text>
                                        <Select<
                                            Option,
                                            false,
                                            GroupBase<Option>
                                        >
                                            isClearable
                                            onChange={(e) => {
                                                setFixedPeriodType(
                                                    () =>
                                                        (e?.value as FixedPeriodType) ||
                                                        "MONTHLY"
                                                );
                                            }}
                                            value={fixedPeriodTypeOptions.find(
                                                ({ value }) =>
                                                    value === fixedPeriodType
                                            )}
                                            options={fixedPeriodTypeOptions}
                                            size="sm"
                                        />
                                    </Stack>
                                    <Stack w="100px">
                                        <Text>Year</Text>

                                        <NumberInput
                                            size="sm"
                                            min={1900}
                                            value={year}
                                            onChange={(_, val) => {
                                                setYear(() => val);
                                            }}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </Stack>
                                </Stack>
                                <Stack overflow="auto" maxH="400px">
                                    {availableFixedPeriods.map((val) => (
                                        <Text
                                            key={val.id}
                                            cursor="pointer"
                                            onClick={() =>
                                                onChange(
                                                    [
                                                        ...selectedPeriods,
                                                        {
                                                            value: val.id,
                                                            label: val.name,
                                                            type: "fixed",
                                                        },
                                                    ],
                                                    false
                                                )
                                            }
                                        >
                                            {val.name}
                                        </Text>
                                    ))}
                                </Stack>
                            </Stack>
                        </TabPanel>
                        <TabPanel>
                            <Stack>
                                <Text>Select Date Range</Text>
                                <RangePicker
                                    presets={rangePresets}
                                    onChange={onRangeChange}
                                />
                            </Stack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Stack>
            <Stack
                w="48px"
                alignItems="center"
                justifyContent="center"
                spacing={1}
            >
                <IconButton
                    aria-label="Search database"
                    icon={<BiArrowToRight />}
                    onClick={() => {
                        const others: Period[] =
                            tabIndex === 0
                                ? availableRelativePeriods.map((val) => {
                                      const opt: Period = {
                                          ...val,
                                          type: "relative",
                                      };
                                      return opt;
                                  })
                                : tabIndex === 1
                                ? availableFixedPeriods.map(
                                      ({ id, name, startDate, endDate }) => {
                                          return {
                                              value: id,
                                              label: name,
                                              startDate,
                                              endDate,
                                              type: "fixed",
                                          };
                                      }
                                  )
                                : [];
                        onChange([...selectedPeriods, ...others], false);
                    }}
                />

                <IconButton
                    aria-label="Search database"
                    icon={<BiArrowToLeft />}
                    onClick={() => onChange([], true)}
                />
            </Stack>
            <Stack
                flex={1}
                borderColor="gray.200"
                borderStyle="solid"
                borderWidth="1px"
            >
                <Tabs>
                    <TabList>
                        <Tab>Selected Periods</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Stack overflow="auto">
                                {selectedPeriods.map(({ value, label }) => (
                                    <Text
                                        key={value}
                                        cursor="pointer"
                                        onClick={() =>
                                            onChange(
                                                selectedPeriods.filter(
                                                    (v) => v.value !== value
                                                ),
                                                true
                                            )
                                        }
                                    >
                                        {label}
                                    </Text>
                                ))}
                            </Stack>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Stack>
        </Stack>
    );
};

export default PeriodPicker;
