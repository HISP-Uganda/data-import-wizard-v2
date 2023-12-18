import {
    Button,
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    Text,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-location";
import { useQueryClient } from "@tanstack/react-query";
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
    groupGoData4Insert,
    IDataSet,
    IMapping,
    IProgram,
    loadPreviousGoData,
    makeMetadata,
    makeValidation,
    Mapping,
    processPreviousInstances,
    programStageUniqElements,
    programUniqAttributes,
    StageMapping,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { chunk } from "lodash";
import { ChangeEvent, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { LocationGenerics } from "../Interfaces";
import { aggregateMappingApi, dataSetApi } from "../pages/aggregate";
import {
    attributeMappingApi,
    currentSourceOptionsApi,
    goDataApi,
    goDataOptionsApi,
    optionMappingApi,
    ouMappingApi,
    programApi,
    programMappingApi,
    remoteOrganisationsApi,
    stageMappingApi,
    tokensApi,
} from "../pages/program";
import { loadPreviousMapping, loadProgram } from "../Queries";
import { $version, actionApi } from "../Store";
import { saveProgramMapping } from "../utils/utils";

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
    const queryClient = useQueryClient();
    const toast = useToast();
    const [inserted, setInserted] = useState<any[]>([]);
    const [errored, setErrored] = useState<any[]>([]);
    const [conflicted, setConflicted] = useState<any[]>([]);
    const [updated, setUpdated] = useState<any[]>([]);
    const navigate = useNavigate<LocationGenerics>();
    const [currentMapping, setCurrentMapping] = useState<string>("");
    const [currentName, setCurrentName] = useState<string>(`Copy of ${name}`);

    const version = useStore($version);

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const clone = async (id: string) => {
        const previousMappings = await loadPreviousMapping(
            engine,
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
            } = await getPreviousProgramMapping(mapping);
            const programMapping = {
                ...mapping,
                id: generateUid(),
                name: currentName,
            };

            await saveProgramMapping({
                engine,
                programMapping,
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
            const { attributeMapping, organisationUnitMapping, dataSet } =
                await getPreviousAggregateMapping(mapping);
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

    const handleCancel = () => {
        setOpen(() => false);
    };

    const getPreviousProgramMapping = async (mapping: Partial<IMapping>) => {
        setMessage(() => "Fetching other mappings");
        const previousMappings = await loadPreviousMapping(
            engine,
            [
                "iw-ou-mapping",
                "iw-attribute-mapping",
                "iw-stage-mapping",
                "iw-option-mapping",
            ],
            mapping.id ?? ""
        );
        const programStageMapping: StageMapping =
            previousMappings["iw-stage-mapping"] || {};
        const attributeMapping: Mapping =
            previousMappings["iw-attribute-mapping"] || {};
        const organisationUnitMapping: Mapping =
            previousMappings["iw-ou-mapping"] || {};
        const optionMapping: Record<string, string> =
            previousMappings["iw-option-mapping"] || {};

        setMessage(() => "Loading program for saved mapping");

        let program = {};

        if (mapping.program?.program) {
            program = await loadProgram<IProgram>({
                engine,
                resource: "programs",
                id: mapping.program.program,
                fields: "id,name,trackedEntityType,organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,repeatable,name,code,programStageDataElements[id,compulsory,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
            });
        }

        return {
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
            program,
        };
    };

    const getPreviousAggregateMapping = async (mapping: Partial<IMapping>) => {
        setMessage(() => "Fetching saved mapping");
        const previousMappings = await loadPreviousMapping(
            engine,
            ["iw-ou-mapping", "iw-attribute-mapping"],
            mapping.id ?? ""
        );
        const attributeMapping: Mapping =
            previousMappings["iw-attribute-mapping"] || {};
        const organisationUnitMapping: Mapping =
            previousMappings["iw-ou-mapping"] || {};

        let dataSet: Partial<IDataSet> = {};

        if (mapping.aggregate?.dataSet) {
            setMessage(() => "Loading data set for saved mapping");
            dataSet = await loadProgram<Partial<IDataSet>>({
                engine,
                resource: "dataSets",
                id: mapping.aggregate?.dataSet || "",
                fields: "id,name,code,organisationUnits[id,name,code],categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]],dataSetElements[dataElement[id,name,code,categoryCombo[categories[id,name,code,categoryOptions[id,name,code]],categoryOptionCombos[code,name,id,categoryOptions[id,name,code]]]]]",
            });
        }

        return {
            attributeMapping,
            organisationUnitMapping,
            dataSet,
        };
    };

    const runDataSet = async (mapping: Partial<IMapping>) => {
        setMessage(() => "Fetching saved mapping");
        const { attributeMapping, dataSet, organisationUnitMapping } =
            await getPreviousAggregateMapping(mapping);
    };

    const runProgram = async (mapping: Partial<IMapping>) => {
        setMessage(() => "Fetching saved mapping");

        const {
            attributeMapping,
            program,
            organisationUnitMapping,
            programStageMapping,
            optionMapping,
        } = await getPreviousProgramMapping(mapping);

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
                    { engine },
                    mapping,
                    {},
                    [],
                    false,
                    async (trackedEntityInstances, page) => {
                        setMessage(
                            () => `Working on page ${page} for tracked entities`
                        );
                        const { conflicts, errors, processed } =
                            convertToGoData(
                                flattenTrackedEntityInstances({
                                    trackedEntityInstances,
                                }),
                                organisationUnitMapping,
                                attributeMapping,
                                outbreak,
                                optionMapping,
                                tokens,
                                metadata
                            );

                        const { updates, inserts } = processed;
                        await groupGoData4Insert(
                            outbreak,
                            inserts,
                            updates,
                            prev,
                            mapping.authentication || {},
                            setMessage,
                            setInserted,
                            setUpdated,
                            setErrored
                        );
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
                const metadata = makeMetadata(program, mapping, {
                    data: goDataData,
                    programStageMapping,
                    attributeMapping,
                    remoteOrganisations: getLowestLevelParents(organisations),
                    goData: outbreak,
                    tokens,
                });
                for (const current of chunk(goDataData, 25)) {
                    await fetchTrackedEntityInstances(
                        { engine },
                        mapping,
                        {},
                        metadata.uniqueAttributeValues,
                        true,
                        async (trackedEntityInstances) => {
                            const previous = processPreviousInstances(
                                trackedEntityInstances,
                                programUniqAttributes(attributeMapping),
                                programStageUniqElements(programStageMapping),
                                mapping.program?.program || ""
                            );
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
            engine,
            ["iw-mapping"],
            id
        );
        const mapping: Partial<IMapping> = previousMappings["iw-mapping"] ?? {};

        if (mapping.type === "aggregate") {
            await runDataSet(mapping);
        } else if (mapping.type === "individual") {
            await runProgram(mapping);
        }
        onClose();
    };

    const loadMapping = async (id: string) => {
        onOpen();
        actionApi.edit();
        setMessage(() => "Loading previous mapping");
        const previousMappings = await loadPreviousMapping(
            engine,
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
            } = await getPreviousProgramMapping(mapping);
            programApi.set(program);
            stageMappingApi.set(programStageMapping);
            attributeMappingApi.set(attributeMapping);
            ouMappingApi.set(organisationUnitMapping);
            programMappingApi.set(mapping);
            optionMappingApi.set(optionMapping);

            if (mapping.dataSource === "go-data") {
                setMessage(() => "Getting Go.Data token");
                const token = await getGoDataToken(mapping);
                setMessage(() => "Loading previous data");
                const {
                    options,
                    organisations,
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
            }
            onClose();
            navigate({ to: "./individual" });
        } else if (mapping.type === "aggregate") {
            const { attributeMapping, organisationUnitMapping, dataSet } =
                await getPreviousAggregateMapping(mapping);
            aggregateMappingApi.set(mapping);
            dataSetApi.set(dataSet);
            attributeMappingApi.set(attributeMapping);
            ouMappingApi.set(organisationUnitMapping);
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
