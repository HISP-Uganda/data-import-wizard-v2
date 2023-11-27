import {
    Checkbox,
    Icon,
    Input,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Tfoot,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { GroupBase, Select, AsyncSelect } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";

import { usePagination } from "@ajna/pagination";
import {
    $aggMetadata,
    $aggregateMapping,
    aggMetadataApi,
} from "../../pages/aggregate";
import {
    $names,
    $organisationUnitMapping,
    ouMappingApi,
} from "../../pages/program";
import DestinationIcon from "../DestinationIcon";
import Paginated from "../Paginated";
import Progress from "../Progress";
import Search from "../Search";
import SourceIcon from "../SourceIcon";
import { getDHIS2Resource } from "../../Queries";
import { useDataEngine } from "@dhis2/app-runtime";

export default function OrganisationMapping() {
    const aggregateMetadata = useStore($aggMetadata);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const aggregateMapping = useStore($aggregateMapping);
    const { source, destination } = useStore($names);
    const [querying, setQuerying] = useState<string | undefined>(
        aggregateMapping.orgUnitColumn
    );
    const [message, setMessage] = useState<string>("");
    const engine = useDataEngine();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure();
    const [fetching, setFetching] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentOrganisations, setCurrentOrganisations] = useState(
        aggregateMetadata.destinationOrgUnits || []
    );

    const [ouSearch, setOuSearch] = useState<string>("");

    const outerLimit = 4;
    const innerLimit = 4;

    // pagination hook
    const {
        pages,
        pagesCount,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
    } = usePagination({
        total: currentOrganisations?.length || 0,
        limits: {
            outer: outerLimit,
            inner: innerLimit,
        },
        initialState: {
            pageSize: 10,
            currentPage: 1,
        },
    });

    const fetchOrganisationsByLevel = async () => {
        onOpen();
        if (aggregateMapping.aggregate?.indicatorGenerationLevel) {
            setMessage(() => "Fetching organisations by level");
            const units = await getDHIS2Resource<Option>({
                isCurrentDHIS2: aggregateMapping.isCurrentInstance,
                engine,
                resource: "organisationUnits.json",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    level: aggregateMapping.aggregate.indicatorGenerationLevel,
                    paging: "false",
                },
                auth: aggregateMapping.authentication,
                resourceKey: "organisationUnits",
            });
            aggMetadataApi.set({ key: "sourceOrgUnits", value: units });
            setQuerying(() => "querying");
            onClose();
        }
    };

    useEffect(() => {
        fetchOrganisationsByLevel();
        return () => {};
    }, []);

    useEffect(() => {
        onOpen();
        setMessage(() => "Trying to automatically map");
        for (const {
            value: destinationValue,
            label: destinationLabel,
        } of aggregateMetadata.destinationOrgUnits) {
            if (organisationUnitMapping[destinationValue ?? ""] === undefined) {
                const search = aggregateMetadata.sourceOrgUnits.find(
                    ({ value }) => value === destinationValue
                );
                if (search) {
                    ouMappingApi.update({
                        attribute: `${destinationValue}`,
                        key: "value",
                        value: search.value,
                    });
                } else {
                    const search2 = aggregateMetadata.sourceOrgUnits.find(
                        ({ label }) => label === destinationLabel
                    );
                    if (search2) {
                        ouMappingApi.update({
                            attribute: `${destinationValue}`,
                            key: "value",
                            value: search2.value,
                        });
                    } else {
                        const search3 = aggregateMetadata.sourceOrgUnits.find(
                            ({ label }) => label === destinationValue
                        );
                        if (search3) {
                            ouMappingApi.update({
                                attribute: `${destinationValue}`,
                                key: "value",
                                value: search3.value,
                            });
                        } else {
                            const search4 =
                                aggregateMetadata.sourceOrgUnits.find(
                                    ({ value }) => value === destinationLabel
                                );

                            if (search4) {
                                ouMappingApi.update({
                                    attribute: `${destinationValue}`,
                                    key: "value",
                                    value: search4.value,
                                });
                            }
                        }
                    }
                }
            }
        }
        onClose();
    }, [aggregateMapping.orgUnitColumn, querying]);

    const onOK = async () => {
        setFetching(() => true);
        // const { data } = await remoteOrganisationApi.get("");
        // remoteOrganisationsApi.set(data);
        setFetching(() => false);
        onCloseModal();
    };
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const fileObj = event.target.files && event.target.files[0];
        if (!fileObj) {
            return;
        }

        console.log("fileObj is", fileObj);

        // 👇️ reset file input
        event.target.value = "";

        // 👇️ is now empty
        console.log(event.target.files);

        // 👇️ can still access file object here
        console.log(fileObj);
        console.log(fileObj.name);
    };

    // handlers
    const handlePageChange = (nextPage: number): void => {
        setCurrentPage(nextPage);
    };

    const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const pageSize = Number(event.target.value);
        setPageSize(pageSize);
    };

    return (
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            <Search
                options={aggregateMetadata.destinationOrgUnits}
                action={setCurrentOrganisations}
                searchString={ouSearch}
                setCurrentPage={setCurrentPage}
                setSearchString={setOuSearch}
                mapping={organisationUnitMapping}
                label="Show Mapped Organisations Only"
                placeholder="Search organisation units"
            />
            <Table size="sm">
                <Thead>
                    <Tr h="30px">
                        <Th textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <DestinationIcon mapping={aggregateMapping} />
                                <Text>Destination Organization</Text>
                                <Text>{destination}</Text>
                            </Stack>
                        </Th>
                        <Th
                            w="150px"
                            textAlign="center"
                            minH="50px"
                            textTransform="none"
                        >
                            <Text> Manually Map</Text>
                        </Th>
                        <Th w="45%" textTransform="none">
                            <Stack direction="row" alignItems="center">
                                <SourceIcon mapping={aggregateMapping} />
                                <Text>Source Organization</Text>
                                <Text>{source}</Text>
                            </Stack>
                        </Th>
                        <Th w="100px" minH="50px" textTransform="none">
                            <Text>Mapped?</Text>
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {currentOrganisations
                        .slice(
                            currentPage * pageSize - pageSize,
                            pageSize * currentPage
                        )
                        .map(({ value, label }) => (
                            <Tr key={value} _hover={{ bg: "green.50" }}>
                                <Td>{label}</Td>
                                <Td textAlign="center">
                                    <Checkbox
                                        isChecked={
                                            getOr(
                                                {
                                                    value: "",
                                                    manual: false,
                                                },
                                                value ?? "",
                                                organisationUnitMapping
                                            ).manual
                                        }
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            ouMappingApi.update({
                                                attribute: `${value}`,
                                                key: "manual",
                                                value: e.target.checked,
                                            })
                                        }
                                    />
                                </Td>
                                <Td>
                                    {getOr(
                                        {
                                            value: "",
                                            manual: false,
                                        },
                                        value ?? "",
                                        organisationUnitMapping
                                    ).manual ? (
                                        <Input
                                            value={
                                                getOr(
                                                    {
                                                        value: "",
                                                        manual: false,
                                                    },
                                                    value ?? "",
                                                    organisationUnitMapping
                                                ).value
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                ouMappingApi.update({
                                                    attribute: `${value}`,
                                                    key: "value",
                                                    value: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <AsyncSelect<
                                            Option,
                                            false,
                                            GroupBase<Option>
                                        >
                                            value={aggregateMetadata.sourceOrgUnits.find(
                                                (val) =>
                                                    val.value ===
                                                    getOr(
                                                        {
                                                            value: "",
                                                            manual: false,
                                                        },
                                                        value ?? "",
                                                        organisationUnitMapping
                                                    ).value
                                            )}
                                            onChange={(e) =>
                                                ouMappingApi.update({
                                                    attribute: `${value}`,
                                                    key: "value",
                                                    value: e?.value,
                                                })
                                            }
                                            loadOptions={(
                                                inputValue,
                                                callback
                                            ) => {
                                                setTimeout(() => {
                                                    const values =
                                                        aggregateMetadata.sourceOrgUnits.filter(
                                                            (i) =>
                                                                i.label
                                                                    .toLowerCase()
                                                                    .includes(
                                                                        inputValue.toLowerCase()
                                                                    )
                                                        );
                                                    callback(
                                                        values.slice(0, 10)
                                                    );
                                                }, 100);
                                            }}
                                        />
                                    )}
                                </Td>
                                <Td>
                                    {organisationUnitMapping[value ?? ""]
                                        ?.value && (
                                        <Icon
                                            as={FiCheck}
                                            color="green.400"
                                            fontSize="2xl"
                                        />
                                    )}
                                </Td>
                            </Tr>
                        ))}
                </Tbody>
                <Tfoot>
                    <Tr>
                        <Td colSpan={4} textAlign="right">
                            Mapped{" "}
                            {Object.keys(organisationUnitMapping || {}).length}{" "}
                            of{" "}
                            {aggregateMetadata.destinationOrgUnits?.length || 0}
                        </Td>
                    </Tr>
                </Tfoot>
            </Table>

            <Paginated
                pages={pages}
                pagesCount={pagesCount}
                currentPage={currentPage}
                handlePageSizeChange={handlePageSizeChange}
                handlePageChange={handlePageChange}
                pageSize={pageSize}
            />
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
}
