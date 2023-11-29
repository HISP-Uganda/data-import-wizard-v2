import {
    Button,
    Checkbox,
    Icon,
    Input,
    Stack,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { IMapping, Option } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Event } from "effector";
import Table, { ColumnsType } from "antd/es/table";
import {
    $names,
    $organisationUnitMapping,
    $remoteOrganisationApi,
    ouMappingApi,
    remoteOrganisationsApi,
} from "../pages/program";
import { APICredentialsModal } from "./APICredentialsModal";
import DestinationIcon from "./DestinationIcon";
import Progress from "./Progress";
import Search from "./Search";
import SourceIcon from "./SourceIcon";
export default function OrganisationUnitMapping({
    destinationOrgUnits,
    sourceOrgUnits,
    mapping,
    update,
}: {
    destinationOrgUnits: Option[];
    sourceOrgUnits: Option[];
    mapping: Partial<IMapping>;
    update: Event<{ attribute: keyof IMapping; value: any; key?: string }>;
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure();
    const { source, destination } = useStore($names);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const remoteOrganisationApi = useStore($remoteOrganisationApi);
    const [fetching, setFetching] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentOrganisations, setCurrentOrganisations] =
        useState(destinationOrgUnits);

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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        ouMappingApi.update({
                            attribute: `${value}`,
                            key: "manual",
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
                            manual: false,
                        },
                        value ?? "",
                        organisationUnitMapping
                    ).manual
                ) {
                    return (
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
                        value={sourceOrgUnits.find(
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
                        options={sourceOrgUnits}
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
                if (organisationUnitMapping[value ?? ""]?.value) {
                    return (
                        <Icon as={FiCheck} color="green.400" fontSize="2xl" />
                    );
                }
                return null;
            },
            key: "mapped",
        },
    ];

    useEffect(() => {
        for (const {
            value: destinationValue,
            label,
            code,
        } of destinationOrgUnits) {
            if (!organisationUnitMapping[destinationValue ?? ""]) {
                const search = sourceOrgUnits.find(
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
    }, [mapping.orgUnitColumn]);

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
        console.log(event.target.files);
        console.log(fileObj);
        console.log(fileObj.name);
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
                            update({
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
                        updateMapping={update}
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
                options={destinationOrgUnits}
                action={setCurrentOrganisations}
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
                        {Object.keys(organisationUnitMapping || {}).length} of{" "}
                        {destinationOrgUnits.length}
                    </Text>
                )}
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
