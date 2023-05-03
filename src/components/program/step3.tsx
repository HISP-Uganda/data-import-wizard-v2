import {
    Button,
    Checkbox,
    Input,
    Stack,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure,
} from "@chakra-ui/react";
import { GroupBase, Select } from "chakra-react-select";
import { Option } from "diw-utils";
import { useStore } from "effector-react";
import { getOr } from "lodash/fp";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
    $metadata,
    $organisationUnitMapping,
    $program,
    $programMapping,
    $remoteOrganisationApi,
    ouMappingApi,
    programMappingApi,
    remoteOrganisationsApi,
} from "../../pages/program/Store";
import { APICredentialsModal } from "../APICredentialsModal";
import Progress from "../Progress";
const Step3 = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpenModal,
        onOpen: onOpenModal,
        onClose: onCloseModal,
    } = useDisclosure();
    const metadata = useStore($metadata);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const remoteOrganisationApi = useStore($remoteOrganisationApi);
    const programMapping = useStore($programMapping);
    const program = useStore($program);
    const [fetching, setFetching] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        for (const {
            value: destinationValue,
            label,
            code,
        } of metadata.destinationOrgUnits) {
            if (!organisationUnitMapping[destinationValue]) {
                const search = metadata.sourceOrgUnits.find(
                    ({ value, label }) => destinationValue === value
                );
                if (search) {
                    ouMappingApi.update({
                        attribute: `${destinationValue}.value`,
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
    return (
        <Stack>
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
            <Table colorScheme="facebook" size="sm">
                <Thead>
                    <Tr>
                        <Th py="20px">Destination Organization</Th>
                        <Th w="200px" textAlign="center" py="20px">
                            Manually Map
                        </Th>
                        <Th py="20px">Source Organization</Th>
                        <Th w="100px" py="20px">
                            Mapped?
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {metadata.destinationOrgUnits
                        ?.slice(0, 10)
                        .map(({ value, label }) => (
                            <Tr key={value}>
                                <Td w="400px">{label}</Td>
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
                                                value,
                                                organisationUnitMapping
                                            ).manual
                                        }
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            ouMappingApi.update({
                                                attribute: `${value}.manual`,
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
                                        value,
                                        organisationUnitMapping
                                    ).manual ? (
                                        <Input
                                            value={
                                                getOr(
                                                    {
                                                        value: "",
                                                        manual: false,
                                                    },
                                                    value,
                                                    organisationUnitMapping
                                                ).value
                                            }
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>
                                            ) =>
                                                ouMappingApi.update({
                                                    attribute: `${value}.value`,
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
                                                        value,
                                                        organisationUnitMapping
                                                    ).value
                                            )}
                                            options={metadata.sourceOrgUnits}
                                            isClearable
                                            onChange={(e) =>
                                                ouMappingApi.update({
                                                    attribute: `${value}.value`,
                                                    value: e?.value || "",
                                                })
                                            }
                                        />
                                    )}
                                </Td>
                                <Td></Td>
                            </Tr>
                        ))}
                </Tbody>
            </Table>
            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message="Trying to automatically map"
                onOpen={onOpen}
            />
        </Stack>
    );
};

export default Step3;
