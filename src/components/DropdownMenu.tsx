import {
    Button,
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-location";
import {
    convertToDHIS2,
    convertToGoData,
    fetchGoDataData,
    fetchRemote,
    fetchTrackedEntityInstances,
    flattenTrackedEntityInstances,
    generateUid,
    getGoDataToken,
    getLowestLevelParents,
    getPreviousProgramMapping,
    IDataSet,
    IMapping,
    IProgram,
    loadPreviousGoData,
    loadPreviousMapping,
    makeMetadata,
    makeValidation,
    Mapping,
    processPreviousInstances,
    programStageUniqElements,
    programUniqAttributes,
} from "data-import-wizard-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useStore } from "effector-react";
import { chunk } from "lodash";
import { ChangeEvent, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { db } from "../db";
import {
    attributeMappingApi,
    attributionMappingApi,
    currentSourceOptionsApi,
    dataSetApi,
    dhis2DataSetApi,
    dhis2ProgramApi,
    goDataApi,
    goDataOptionsApi,
    mappingApi,
    optionMappingApi,
    ouMappingApi,
    programApi,
    remoteOrganisationsApi,
    stageMappingApi,
    tokensApi,
} from "../Events";
import { LocationGenerics } from "../Interfaces";

import { getDHIS2Resource, loadProgram } from "../Queries";
import { $mapping, $version, actionApi, hasErrorApi } from "../Store";
import { saveProgramMapping } from "../utils/utils";
import DataImportSummary from "./DataImportSummary";
import DataPreview from "./DataPreview";
import MappingOptions from "./MappingOptions";
import SwitchComponent, { Case } from "./SwitchComponent";

export default function DropdownMenu({
    id,
    data,
    message,
    setMessage,
    isOpen,
    onOpen,
    onClose,
    afterDelete,
    afterClone,
    name,
}: {
    id: string;
    data: any[];
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    afterDelete: (id: string) => void;
    afterClone: (mapping: Partial<IMapping>) => void;
    name: string;
}) {
    const engine = useDataEngine();
    const toast = useToast();
    const navigate = useNavigate<LocationGenerics>();
    const [currentMapping, setCurrentMapping] = useState<string>("");
    const [currentName, setCurrentName] = useState<string>(`Copy of ${name}`);
    const version = useStore($version);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
    const workingMapping = useStore($mapping);
    const [action, setAction] = useState<
        "configuring" | "previewing" | "uploading"
    >("configuring");

    const responses = useLiveQuery(() =>
        db.dataValueResponses.where({ completed: "false" }).toArray()
    );

    const clone = async (id: string) => {
        const previousMappings = await loadPreviousMapping(
            { engine },
            ["iw-mapping"],
            id
        );
        const mapping: Partial<IMapping> = previousMappings["iw-mapping"] ?? {};
        if (mapping.type === "individual") {
            const {
                programStageMapping,
                attributeMapping,
                organisationUnitMapping,
                optionMapping,
            } = await getPreviousProgramMapping(
                { engine },
                mapping,
                (message: string) => setMessage(() => message)
            );
            const programMapping = {
                ...mapping,
                id: generateUid(),
                name: currentName,
            };

            await saveProgramMapping({
                engine,
                mapping: programMapping,
                action: "creating",
                organisationUnitMapping,
                programStageMapping,
                attributeMapping,
                optionMapping,
            });
            setLoading(() => false);
            setOpen(() => false);
            afterClone(programMapping);
            await loadMapping(programMapping.id);
        } else if (mapping.type === "aggregate") {
            // const { attributeMapping, organisationUnitMapping, dataSet } =
            //     await getPreviousAggregateMapping(mapping);
        }
    };

    const showModal = (id: string) => {
        setCurrentMapping(() => id);
        setOpen(() => true);
    };

    const handleOk = async () => {
        setLoading(() => true);
        await clone(currentMapping);
    };
    const handleOptionsOk = async () => {
        await runMapping(workingMapping);
    };

    const handleCancel = () => {
        setOpen(() => false);
    };
    const handleOptionsCancel = () => {
        setOptionsDialogOpen(() => false);
    };

    const getPreviousAggregateMapping = async (mapping: Partial<IMapping>) => {
        setMessage(() => "Fetching saved mapping");
        const previousMappings = await loadPreviousMapping(
            { engine },
            ["iw-ou-mapping", "iw-attribute-mapping", "iw-attribution-mapping"],
            mapping.id ?? ""
        );
        const attributeMapping: Mapping =
            previousMappings["iw-attribute-mapping"] || {};
        const organisationUnitMapping: Mapping =
            previousMappings["iw-ou-mapping"] || {};
        const attributionMapping: Mapping =
            previousMappings["iw-attribution-mapping"] || {};

        let dataSet: Partial<IDataSet> = {};
        if (mapping.aggregate?.dataSet) {
            setMessage(() => "Loading data set for saved mapping");
            dataSet = await loadProgram<Partial<IDataSet>>({
                engine,
                resource: "dataSets",
                id: mapping.aggregate.dataSet,
                fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
            });
        }
        return {
            attributeMapping,
            organisationUnitMapping,
            dataSet,
            attributionMapping,
        };
    };

    const runDataSet = async (mapping: Partial<IMapping>) => {
        if (
            mapping.dataSource &&
            [
                "csv-line-list",
                "xlsx-line-list",
                "xlsx-tabular-data",
                "xlsx-form",
                "json",
            ].indexOf(mapping.dataSource) !== -1
        ) {
            setAction(() => "previewing");
        } else {
            setOptionsDialogOpen(() => false);
            onOpen();
            setMessage(() => "Fetching saved mapping");
            const {
                attributeMapping,
                attributionMapping,
                organisationUnitMapping,
            } = await getPreviousAggregateMapping(mapping);

            attributeMappingApi.set(attributeMapping);
            ouMappingApi.set(organisationUnitMapping);
            attributionMappingApi.set(attributionMapping);
            onClose();

            setOptionsDialogOpen(() => true);
            if (mapping.prefetch) {
                setAction(() => "previewing");
            } else {
                setAction(() => "uploading");
            }
        }
    };

    const runProgram = async (mapping: Partial<IMapping>) => {
        setMessage(() => "Fetching saved mapping");
        const {
            attributeMapping,
            program,
            organisationUnitMapping,
            programStageMapping,
            optionMapping,
        } = await getPreviousProgramMapping(
            { engine },
            mapping,
            (message: string) => setMessage(() => message)
        );

        const { attributes, elements } = makeValidation(program);
        const {
            params,
            basicAuth,
            hasNextLink,
            headers,
            password,
            username,
            ...rest
        } = mapping.authentication || {};
        if (mapping.dataSource === "go-data") {
            setMessage(() => "Fetching go data token");
            const token = await getGoDataToken(mapping);
            const { options, organisations, outbreak, tokens } =
                await loadPreviousGoData(token, mapping);
            if (mapping.isSource) {
                setMessage(() => "Fetching go data cases");
                const { metadata, prev } = await fetchGoDataData(
                    outbreak,
                    mapping.authentication || {}
                );
                setMessage(() => "Fetching tracked entity instances");
                await fetchTrackedEntityInstances(
                    {
                        api: { engine },
                        program: mapping.program?.program,
                        additionalParams: {},
                        uniqueAttributeValues: [],
                        withAttributes: false,
                        trackedEntityInstances: [],
                    },
                    async (trackedEntityInstances, page) => {
                        setMessage(
                            () => `Working on page ${page} for tracked entities`
                        );
                        const { conflicts, errors, processed } =
                            convertToGoData(
                                flattenTrackedEntityInstances(
                                    {
                                        trackedEntityInstances,
                                    },
                                    "ALL"
                                ),
                                organisationUnitMapping,
                                attributeMapping,
                                outbreak,
                                optionMapping,
                                tokens,
                                metadata
                            );

                        const { updates, inserts } = processed;
                        // await groupGoData4Insert(
                        //     outbreak,
                        //     inserts,
                        //     updates,
                        //     prev,
                        //     mapping.authentication || {},
                        //     setMessage,
                        //     setInserted,
                        //     setUpdated,
                        //     setErrored
                        // );
                    }
                );
            } else {
                const goDataData = await fetchRemote<any[]>(
                    {
                        ...rest,
                        params: {
                            auth: { param: "access_token", value: token },
                        },
                    },
                    `api/outbreaks/${mapping.program?.remoteProgram}/cases`
                );
                const metadata = makeMetadata({
                    program,
                    mapping,
                    data: goDataData,
                    programStageMapping,
                    attributeMapping,
                    remoteOrganisations: getLowestLevelParents(organisations),
                    goData: outbreak,
                    tokens,
                });
                for (const current of chunk(goDataData, 25)) {
                    await fetchTrackedEntityInstances(
                        {
                            api: { engine },
                            program: mapping.program?.program,
                            additionalParams: {},
                            uniqueAttributeValues:
                                metadata.uniqueAttributeValues,
                            withAttributes: true,
                            trackedEntityInstances:
                                metadata.trackedEntityInstanceIds,
                        },
                        async (trackedEntityInstances) => {
                            const previous = processPreviousInstances({
                                trackedEntityInstances,
                                programUniqAttributes:
                                    programUniqAttributes(attributeMapping),
                                programStageUniqueElements:
                                    programStageUniqElements(
                                        programStageMapping
                                    ),
                                trackedEntityIdIdentifiesInstance: false,
                                eventIdIdentifiesEvent: false,

                                currentProgram: mapping.program?.program,
                            });
                            const results = await convertToDHIS2({
                                previousData: previous,
                                data: current,
                                mapping,
                                organisationUnitMapping,
                                attributeMapping,
                                programStageMapping,
                                optionMapping,
                                version,
                                program,
                            });
                        }
                    );
                }
            }
        }

        if (["api", "go-data"].indexOf(mapping.dataSource || "") !== -1) {
        }
    };

    const run = async (id: string) => {
        onOpen();
        const previousMappings = await loadPreviousMapping(
            { engine },
            ["iw-mapping"],
            id
        );
        const mapping: Partial<IMapping> = previousMappings["iw-mapping"] ?? {};
        mappingApi.set(mapping);
        onClose();
        setOptionsDialogOpen(() => true);
    };

    const runMapping = async (mapping: Partial<IMapping>) => {
        if (action === "configuring") {
            if (mapping.type === "aggregate") {
                await runDataSet(mapping);
            } else if (mapping.type === "individual") {
                await runProgram(mapping);
            }
        } else if (action === "previewing") {
            setAction(() => "uploading");
        } else if (action === "uploading") {
            setOptionsDialogOpen(() => false);
            setAction(() => "configuring");
        }
    };

    const loadMapping = async (id: string) => {
        onOpen();
        actionApi.edit();
        setMessage(() => "Loading previous mapping");
        const previousMappings = await loadPreviousMapping(
            { engine },
            ["iw-mapping"],
            id
        );
        const mapping: Partial<IMapping> = previousMappings["iw-mapping"] ?? {};
        if (mapping.type === "individual") {
            const {
                programStageMapping,
                attributeMapping,
                organisationUnitMapping,
                optionMapping,
                program,
            } = await getPreviousProgramMapping(
                { engine },
                mapping,
                (message: string) => setMessage(() => message)
            );
            programApi.set(program);
            stageMappingApi.set(programStageMapping);
            attributeMappingApi.set(attributeMapping);
            ouMappingApi.set(organisationUnitMapping);
            mappingApi.set(mapping);
            optionMappingApi.set(optionMapping);

            if (mapping.dataSource === "go-data") {
                setMessage(() => "Getting Go.Data token");
                try {
                    const token = await getGoDataToken(mapping);
                    setMessage(() => "Loading previous data");
                    const {
                        options,
                        outbreak,
                        tokens,
                        goDataOptions,
                        hierarchy,
                    } = await loadPreviousGoData(token, mapping);
                    goDataApi.set(outbreak);
                    tokensApi.set(tokens);
                    goDataOptionsApi.set(goDataOptions);
                    currentSourceOptionsApi.set(options);
                    remoteOrganisationsApi.set(
                        hierarchy.flat().map(({ id, name, parentInfo }) => ({
                            id,
                            name: `${[
                                ...parentInfo.map(({ name }) => name),
                                name,
                            ].join("/")}`,
                        }))
                    );
                    onClose();
                    navigate({ to: "./individual" });
                } catch (error: any) {
                    toast({
                        title: "Something went wrong",
                        description: error?.message ?? "",
                        status: "error",
                        duration: 9000,
                        isClosable: true,
                    });
                    hasErrorApi.set(true);
                    onClose();
                }
            } else if (mapping.dataSource === "dhis2-program") {
                const remoteProgram = await getDHIS2Resource<IProgram>({
                    engine,
                    isCurrentDHIS2: mapping.isCurrentInstance,
                    resource: `programs/${mapping.program?.remoteProgram}`,
                    auth: mapping.authentication,
                    params: {
                        fields: "id,name,trackedEntityType[id,featureType],programType,featureType,organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,repeatable,featureType,name,code,programStageDataElements[id,compulsory,name,dataElement[id,name,code,optionSetValue,optionSet[id,name,options[id,name,code]]]]],programTrackedEntityAttributes[id,mandatory,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
                    },
                });

                dhis2ProgramApi.set(remoteProgram);

                mappingApi.updateMany({
                    program: {
                        ...mapping.program,
                        incidentDateColumn: "enrollment.incidentDate",
                        enrollmentDateColumn: "enrollment.enrollmentDate",
                    },
                });
                onClose();
                navigate({ to: "./individual" });
            } else {
                onClose();
                navigate({ to: "./individual" });
            }
        } else if (mapping.type === "aggregate") {
            const {
                attributeMapping,
                organisationUnitMapping,
                dataSet,
                attributionMapping,
            } = await getPreviousAggregateMapping(mapping);
            mappingApi.set(mapping);
            console.log(attributeMapping);
            dataSetApi.set(dataSet);
            attributeMappingApi.set(attributeMapping);
            ouMappingApi.set(organisationUnitMapping);
            attributionMappingApi.set(attributionMapping);
            if (mapping.dataSource === "dhis2-data-set") {
                const remoteDataSet = await getDHIS2Resource<IDataSet>({
                    engine,
                    isCurrentDHIS2: mapping.isCurrentInstance,
                    resource: `dataSets/${mapping.aggregate?.remote}`,
                    auth: mapping.authentication,
                    params: {
                        fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
                    },
                });
                dhis2DataSetApi.set(remoteDataSet);
            }
            onClose();
            navigate({ to: "./aggregate" });
        } else {
            onClose();
            navigate({ to: "./aggregate" });
        }
    };
    const deleteMapping = async (id: string) => {
        const mutation: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-mapping",
        };
        const mutation2: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-ou-mapping",
        };
        const mutation3: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-attribute-mapping",
        };
        const mutation4: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-stage-mapping",
        };
        const mutation5: any = {
            type: "delete",
            id,
            resource: "dataStore/iw-option-mapping",
        };

        try {
            engine.mutate(mutation);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation2);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation3);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation4);
        } catch (e: any) {
            console.log(e?.message);
        }
        try {
            engine.mutate(mutation5);
        } catch (e: any) {
            console.log(e?.message);
        }
        afterDelete(id);
        toast({
            title: "Mapping deleted.",
            description: "Mapping has been deleted",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
    };
    return (
        <>
            <Menu>
                <MenuButton
                    as={IconButton}
                    icon={
                        <BiDotsVerticalRounded
                            style={{
                                width: "20px",
                                height: "20px",
                            }}
                        />
                    }
                    bg="none"
                />
                <MenuList>
                    <MenuItem onClick={() => run(id)}>Run</MenuItem>
                    <MenuItem onClick={() => loadMapping(id)}>Edit</MenuItem>
                    <MenuItem onClick={() => showModal(id)}>Clone</MenuItem>
                    {/* <MenuItem>Download</MenuItem> */}
                    <MenuItem onClick={() => deleteMapping(id)}>
                        Delete
                    </MenuItem>
                </MenuList>
            </Menu>

            <Modal
                isOpen={optionsDialogOpen}
                onClose={() => setOptionsDialogOpen(() => false)}
                isCentered
                autoFocus
                size="5xl"
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Options</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SwitchComponent condition={action}>
                            <Case value="previewing">
                                <DataPreview />
                            </Case>
                            <Case value="uploading">
                                <DataImportSummary />
                            </Case>
                            <Case default>
                                <MappingOptions showFileUpload />
                            </Case>
                        </SwitchComponent>
                    </ModalBody>

                    <ModalFooter>
                        <Stack
                            direction="row"
                            spacing="20px"
                            justifyContent="flex-end"
                            key="Buttons"
                        >
                            <Button
                                onClick={handleOptionsCancel}
                                colorScheme="red"
                            >
                                Cancel
                            </Button>
                            <Button
                                isLoading={
                                    action === "uploading" &&
                                    responses &&
                                    responses.length > 0
                                }
                                onClick={handleOptionsOk}
                                colorScheme="green"
                            >
                                OK
                            </Button>
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={open}
                onClose={() => setOpen(() => false)}
                isCentered
                autoFocus
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Set mapping name</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack>
                            <Text>New name</Text>
                            <Input
                                value={currentName}
                                onChange={(
                                    e: ChangeEvent<HTMLInputElement>
                                ) => {
                                    e.persist();
                                    setCurrentName(() => e.target.value);
                                }}
                            />
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Stack
                            direction="row"
                            spacing="20px"
                            justifyContent="flex-end"
                            key="Buttons"
                        >
                            <Button onClick={handleCancel} colorScheme="red">
                                Cancel
                            </Button>
                            <Button
                                isLoading={loading}
                                onClick={handleOk}
                                colorScheme="green"
                            >
                                Clone
                            </Button>
                        </Stack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
