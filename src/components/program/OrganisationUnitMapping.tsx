import {
    Button,
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
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";

import { usePagination } from "@ajna/pagination";
import {
    $metadata,
    $names,
    $organisationUnitMapping,
    $programMapping,
    $remoteOrganisationApi,
    ouMappingApi,
    programMappingApi,
    remoteOrganisationsApi,
} from "../../pages/program";
import { APICredentialsModal } from "../APICredentialsModal";
import DestinationIcon from "../DestinationIcon";
import Paginated from "../Paginated";
import Progress from "../Progress";
import Search from "../Search";
import SourceIcon from "../SourceIcon";
export default function OrganisationUnitMapping() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure();
    const metadata = useStore($metadata);
    const { source, destination } = useStore($names);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const remoteOrganisationApi = useStore($remoteOrganisationApi);
    const programMapping = useStore($programMapping);
    const [fetching, setFetching] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentOrganisations, setCurrentOrganisations] = useState(
        metadata.destinationOrgUnits || []
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

    useEffect(() => {
        for (const {
            value: destinationValue,
            label,
            code,
        } of metadata.destinationOrgUnits) {
            if (!organisationUnitMapping[destinationValue ?? ""]) {
                const search = metadata.sourceOrgUnits.find(
                    ({ value, label }) => destinationValue === value
                );
                if (search) {
                    ouMappingApi.update({
                        attribute: `${destinationValue}`,
                        key: "value",
                        value: search.value,
                    });
                }
            }
        }
    }, [programMapping.orgUnitColumn]);

    const onOK = async () => {
        setFetching(() => true);
        const { data } = await remoteOrganisationApi.get("");
        remoteOrganisationsApi.set(data);
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
            {programMapping.dataSource === "api" && (
                <Stack direction="row" spacing="20px">
                    <Button onClick={() => inputRef.current?.click()}>
                        Upload Organisation Metadata List
                    </Button>
                    <Button
                        onClick={() => {
                            programMappingApi.update({
                                attribute: "orgUnitSource",
                                value: "api",
                            });
                            onOpenModal();
                        }}
                    >
                        Query Metadata from API
                    </Button>
                    <APICredentialsModal
                        isOpen={isOpenModal}
                        onClose={onCloseModal}
                        updateMapping={programMappingApi.update}
                        onOK={onOK}
                        mapping={programMapping}
                        accessor="orgUnitApiAuthentication"
                        fetching={fetching}
                        labelField="remoteOrgUnitLabelField"
                        valueField="remoteOrgUnitValueField"
                    />
                    <input
                        style={{ display: "none" }}
                        ref={inputRef}
                        type="file"
                        onChange={handleFileChange}
                    />
                </Stack>
            )}
            <Search
                options={metadata.destinationOrgUnits}
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
                                <DestinationIcon mapping={programMapping} />
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
                                <SourceIcon mapping={programMapping} />
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
                                        isDisabled={
                                            programMapping.orgUnitsUploaded
                                        }
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
                                        <Select<
                                            Option,
                                            false,
                                            GroupBase<Option>
                                        >
                                            value={metadata.sourceOrgUnits.find(
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
                                            options={metadata.sourceOrgUnits}
                                            isClearable
                                            onChange={(e) =>
                                                ouMappingApi.update({
                                                    attribute: `${value}`,
                                                    key: "value",
                                                    value: e?.value,
                                                })
                                            }
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
                            of {metadata.destinationOrgUnits?.length || 0}
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
                message="Trying to automatically map"
                onOpen={onOpen}
            />
        </Stack>
    );
}
