import {
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    useDisclosure,
    MenuList,
    useToast,
    UseDisclosureProps,
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
    getGoDataToken,
    getLowestLevelParents,
    groupGoData4Insert,
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
import { useState, version } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { LocationGenerics } from "../Interfaces";
import {
    programApi,
    stageMappingApi,
    attributeMappingApi,
    ouMappingApi,
    optionMappingApi,
    goDataApi,
    tokensApi,
    goDataOptionsApi,
    currentSourceOptionsApi,
    remoteOrganisationsApi,
    programMappingApi,
} from "../pages/program";
import { loadPreviousMapping, loadProgram } from "../Queries";
import { $version, actionApi, stepper } from "../Store";

export default function DropdownMenu({
    id,
    data,
    message,
    setMessage,
    isOpen,
    onOpen,
    onClose,
}: {
    id: string;
    data: any[];
    message: string;
    setMessage: React.Dispatch<React.SetStateAction<string>>;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}) {
    const engine = useDataEngine();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [inserted, setInserted] = useState<any[]>([]);
    const [errored, setErrored] = useState<any[]>([]);
    const [conflicted, setConflicted] = useState<any[]>([]);
    const [updated, setUpdated] = useState<any[]>([]);
    const navigate = useNavigate<LocationGenerics>();

    const version = useStore($version);

    const getPreviousMapping = async (id: string) => {
        const previousMappings = await loadPreviousMapping(
            engine,
            [
                "iw-mapping",
                "iw-ou-mapping",
                "iw-attribute-mapping",
                "iw-stage-mapping",
                "iw-option-mapping",
            ],
            id
        );

        const programMapping: Partial<IMapping> =
            previousMappings["iw-mapping"] || {};
        const programStageMapping: StageMapping =
            previousMappings["iw-stage-mapping"] || {};
        const attributeMapping: Mapping =
            previousMappings["iw-attribute-mapping"] || {};
        const organisationUnitMapping: Mapping =
            previousMappings["iw-ou-mapping"] || {};
        const optionMapping: Record<string, string> =
            previousMappings["iw-option-mapping"] || {};

        return {
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
        };
    };
    const run = async (id: string) => {
        onOpen();
        setMessage(() => "Fetching saved mapping");
        const {
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
        } = await getPreviousMapping(id);
        setMessage(() => "Loading program for saved mapping");

        const program = await loadProgram<IProgram>({
            engine,
            resource: "programs",
            id: programMapping.program?.program || "",
            fields: "id,name,trackedEntityType,organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,repeatable,name,code,programStageDataElements[id,compulsory,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
        });

        const { attributes, elements } = makeValidation(program);
        const {
            params,
            basicAuth,
            hasNextLink,
            headers,
            password,
            username,
            ...rest
        } = programMapping.authentication || {};

        if (programMapping.dataSource === "go-data") {
            setMessage(() => "Fetching go data token");
            const token = await getGoDataToken(programMapping);
            const { options, organisations, outbreak, tokens } =
                await loadPreviousGoData(token, programMapping);
            if (programMapping.isSource) {
                setMessage(() => "Fetching go data cases");
                const { metadata, prev } = await fetchGoDataData(
                    outbreak,
                    programMapping.authentication || {}
                );
                setMessage(() => "Fetching tracked entity instances");
                await fetchTrackedEntityInstances(
                    { engine },
                    programMapping,
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
                            programMapping.authentication || {},
                            setMessage,
                            setInserted,
                            setUpdated
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
                    `api/outbreaks/${programMapping.program?.remoteProgram}/cases`
                );
                const metadata = makeMetadata(program, programMapping, {
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
                        programMapping,
                        {},
                        metadata.uniqueAttributeValues,
                        true,
                        async (trackedEntityInstances) => {
                            const previous = processPreviousInstances(
                                trackedEntityInstances,
                                programUniqAttributes(attributeMapping),
                                programStageUniqElements(programStageMapping),
                                programMapping.program?.program || ""
                            );
                            const results = await convertToDHIS2(
                                previous,
                                current,
                                programMapping,
                                organisationUnitMapping,
                                attributeMapping,
                                programStageMapping,
                                optionMapping,
                                version,
                                program
                                // elements,
                                // attributes
                            );
                        }
                    );
                }
            }
        }

        if (
            ["api", "go-data"].indexOf(programMapping.dataSource || "") !== -1
        ) {
        }
        onClose();
    };
    const loadMapping = async (namespaceKey: string) => {
        onOpen();
        actionApi.edit();
        setMessage(() => "Fetching saved mapping");
        const {
            programMapping,
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
        } = await getPreviousMapping(namespaceKey);
        setMessage(() => "Loading program for saved mapping");
        const program = await loadProgram({
            engine,
            resource: "programs",
            id: programMapping.program?.program || "",
            fields: "id,name,trackedEntityType,organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,repeatable,name,code,programStageDataElements[id,compulsory,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
        });
        programApi.set(program);
        stageMappingApi.set(programStageMapping);
        attributeMappingApi.set(attributeMapping);
        ouMappingApi.set(organisationUnitMapping);
        programMappingApi.set(programMapping);
        optionMappingApi.set(optionMapping);

        if (programMapping.dataSource === "go-data") {
            setMessage(() => "Getting Go.Data token");
            const token = await getGoDataToken(programMapping);
            setMessage(() => "Loading previous data");
            const { options, organisations, outbreak, tokens, goDataOptions } =
                await loadPreviousGoData(token, programMapping);
            goDataApi.set(outbreak);
            tokensApi.set(tokens);
            goDataOptionsApi.set(goDataOptions);
            currentSourceOptionsApi.set(options);
            remoteOrganisationsApi.set(getLowestLevelParents(organisations));
        }
        onClose();
        navigate({ to: "./individual" });
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
        await queryClient.cancelQueries(["namespaces", "iw-mapping"]);
        queryClient.setQueryData<IMapping[]>(
            ["namespaces", "iw-mapping"],
            () => {
                return data?.filter(({ id: programId }) => id !== programId);
            }
        );
        toast({
            title: "Mapping deleted.",
            description: "Mapping has been deleted",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
    };
    return (
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
                <MenuItem>Download</MenuItem>
                <MenuItem onClick={() => deleteMapping(id)}>Delete</MenuItem>
            </MenuList>
        </Menu>
    );
}
