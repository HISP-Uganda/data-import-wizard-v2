import {
    Button,
    Checkbox,
    Icon,
    Input,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import Table, { ColumnsType } from "antd/es/table";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import {
    mappingApi,
    metadataApi,
    ouMappingApi,
    remoteOrganisationsApi,
} from "../Events";
import { getDHIS2Resource } from "../Queries";
import {
    $mapping,
    $metadata,
    $names,
    $organisationUnitMapping,
    $remoteOrganisationApi,
} from "../Store";
import { findMapped, isMapped } from "../utils/utils";
import { APICredentialsModal } from "./APICredentialsModal";
import DestinationIcon from "./DestinationIcon";
import Progress from "./Progress";
import Search from "./Search";
import SourceIcon from "./SourceIcon";
export default function OrganisationUnitMapping() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const engine = useDataEngine();
    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure();
    const { source, destination } = useStore($names);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const remoteOrganisationApi = useStore($remoteOrganisationApi);
    const [fetching, setFetching] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const mapping = useStore($mapping);
    const metadata = useStore($metadata);
    const [querying, setQuerying] = useState<string | undefined>(
        mapping.orgUnitColumn
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentOrganisations, setCurrentOrganisations] = useState(
        metadata.destinationOrgUnits
    );

    const [ouSearch, setOuSearch] = useState<string>("");

    const columns: ColumnsType<Partial<Option>> = [
        {
            title: (
                <Stack direction="row" alignItems="center">
                    <DestinationIcon mapping={mapping} />
                    <Text>Destination Organization</Text>
                    <Text>{destination}</Text>
                </Stack>
            ),
            dataIndex: "label",
            key: "label",
        },
        {
            title: "Custom Path",
            key: "manual",
            width: "100px",
            align: "center",
            render: (text, { value }) => (
                <Checkbox
                    isDisabled={mapping.orgUnitsUploaded}
                    isChecked={organisationUnitMapping[value ?? ""]?.isCustom}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        ouMappingApi.update({
                            attribute: `${value}`,
                            key: "isCustom",
                            value: e.target.checked,
                        })
                    }
                />
            ),
        },

        {
            title: (
                <Stack direction="row" alignItems="center">
                    <SourceIcon mapping={mapping} />
                    <Text>Source Organization</Text>
                    <Text>{source}</Text>
                </Stack>
            ),
            key: "source",
            render: (text, { value, valueType, unique }) => {
                if (
                    getOr(
                        {
                            value: "",
                            isCustom: false,
                        },
                        value ?? "",
                        organisationUnitMapping
                    ).isCustom
                ) {
                    return (
                        <Input
                            value={
                                getOr(
                                    {
                                        value: "",
                                        isCustom: false,
                                    },
                                    value ?? "",
                                    organisationUnitMapping
                                ).value
                            }
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                ouMappingApi.update({
                                    attribute: `${value}`,
                                    key: "value",
                                    value: e.target.value,
                                })
                            }
                        />
                    );
                }
                return (
                    <Select<Option, false, GroupBase<Option>>
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
                        size="md"
                        onChange={(e) =>
                            ouMappingApi.update({
                                attribute: `${value}`,
                                key: "value",
                                value: e?.value,
                            })
                        }
                    />
                );
            },
        },

        {
            title: "Mapped",
            width: "100px",
            render: (text, { value }) => {
                if (
                    isMapped(
                        value,
                        organisationUnitMapping,
                        metadata.sourceOrgUnits
                    )
                ) {
                    return (
                        <Icon as={FiCheck} color="green.400" fontSize="2xl" />
                    );
                }
                return null;
            },
            key: "mapped",
        },
    ];

    const fetchOrganisationsByLevel = async () => {
        onOpen();
        if (mapping.aggregate?.indicatorGenerationLevel) {
            setMessage(() => "Fetching organisations by level");
            const { organisationUnits: units } = await getDHIS2Resource<{
                organisationUnits: Array<Option>;
            }>({
                isCurrentDHIS2: mapping.isCurrentInstance,
                engine,
                resource: "organisationUnits.json",
                params: {
                    fields: "id~rename(value),name~rename(label)",
                    level: mapping.aggregate.indicatorGenerationLevel,
                    paging: "false",
                },
                auth: mapping.authentication,
            });
            metadataApi.set({ key: "sourceOrgUnits", value: units });
            setQuerying(() => "querying");
        }
        onClose();
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
        onClose();
    }, [mapping.orgUnitColumn, querying]);

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
        event.target.value = "";
    };

    return (
        <Stack
            h="calc(100vh - 350px)"
            maxH="calc(100vh - 350px)"
            overflow="auto"
        >
            {mapping.dataSource === "api" && (
                <Stack direction="row" spacing="20px">
                    <Button onClick={() => inputRef.current?.click()}>
                        Upload Organisation Metadata List
                    </Button>
                    <Button
                        onClick={() => {
                            mappingApi.update({
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
                        updateMapping={mappingApi.update}
                        onOK={onOK}
                        mapping={mapping}
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
                source={metadata.sourceOrgUnits}
                searchString={ouSearch}
                setSearchString={setOuSearch}
                mapping={organisationUnitMapping}
                label="Show Mapped Organisations Only"
                label2="Show Unmapped Organisations Only"
                placeholder="Search organisation units"
            />
            <Table
                columns={columns}
                dataSource={currentOrganisations}
                rowKey="value"
                pagination={{ pageSize: 10 }}
                size="small"
                footer={() => (
                    <Text textAlign="right">
                        Mapped{" "}
                        {findMapped(
                            organisationUnitMapping,
                            metadata.sourceOrgUnits
                        )}{" "}
                        of {metadata.destinationOrgUnits?.length ?? 0}
                    </Text>
                )}
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
