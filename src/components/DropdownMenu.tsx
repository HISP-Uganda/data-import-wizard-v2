import {
    IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Stack,
    Text,
    useToast,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useNavigate } from "@tanstack/react-location";
import { Modal } from "antd";
import {
    getGoDataToken,
    getPreviousProgramMapping,
    IMapping,
    loadPreviousGoData,
    loadPreviousMapping,
} from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { isEmpty } from "lodash";
import { ChangeEvent, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { CQIDexie } from "../db";
import {
    attributeMappingApi,
    attributionMappingApi,
    currentSourceOptionsApi,
    dataSetApi,
    dhis2DataSetApi,
    dhis2ProgramApi,
    enrollmentMappingApi,
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

import {
    $attributeMapping,
    $attributionMapping,
    $enrollmentMapping,
    $mapping,
    $names,
    $optionMapping,
    $organisationUnitMapping,
    $programStageMapping,
    actionApi,
} from "../Store";
import { isFileBasedMapping, saveMapping } from "../utils/utils";
import DataImportSummary from "./DataImportSummary";
import DataPreview from "./DataPreview";
import ImportExportOptions from "./ImportExportOptions";
import SwitchComponent, { Case } from "./SwitchComponent";

export default function DropdownMenu({
    id,
    onOpen,
    onClose,
    afterDelete,
    afterClone,
    name,
    db,
}: {
    id: string;
    onOpen: () => void;
    onClose: () => void;
    afterDelete: (id: string) => void;
    afterClone: (mapping: Partial<IMapping>) => void;
    name: string;
    db: CQIDexie;
}) {
    const engine = useDataEngine();
    const toast = useToast();
    const navigate = useNavigate<LocationGenerics>();
    const [currentMapping, setCurrentMapping] = useState<string>("");
    const [currentName, setCurrentName] = useState<string>(`Copy of ${name}`);
    const [open, setOpen] = useState(false);
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
    const workingMapping = useStore($mapping);
    const [action, setAction] = useState<
        "configuring" | "previewing" | "uploading"
    >("configuring");

    const optionMapping = useStore($optionMapping);
    const organisationUnitMapping = useStore($organisationUnitMapping);
    const enrollmentMapping = useStore($enrollmentMapping);
    const attributionMapping = useStore($attributionMapping);
    const attributeMapping = useStore($attributeMapping);
    const programStageMapping = useStore($programStageMapping);

    const names = useStore($names);

    const clone = async (id: string) => {
        const mapping = await fetchMapping(id);
        await saveMapping({
            engine,
            mapping: {
                ...mapping,
                ...names,
            },
            action: "creating",
            mappings: {
                organisationUnitMapping,
                attributeMapping,
                programStageMapping,
                enrollmentMapping,
                optionMapping,
                attributionMapping,
            },
        });
        afterClone(mapping);
    };

    const showModal = (id: string) => {
        setCurrentMapping(() => id);
        setOpen(() => true);
    };

    const handleOk = async () => {
        await clone(currentMapping);
    };
    const handleOptionsOk = async () => {
        await runMapping(workingMapping);
    };

    const handleCancel = () => {
        setOpen(() => false);
    };
    const handleOptionsCancel = () => {
        setAction(() => "configuring");
        setOptionsDialogOpen(() => false);
    };
    const runDataSet = async (mapping: Partial<IMapping>) => {
        if (mapping.dataSource && isFileBasedMapping(mapping)) {
            setAction(() => "previewing");
        } else {
            if (mapping.prefetch) {
                setAction(() => "previewing");
            } else {
                setAction(() => "uploading");
            }
        }
    };

    const runProgram = async (mapping: Partial<IMapping>) => {
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
            if (mapping.prefetch) {
                setAction(() => "previewing");
            } else {
                setAction(() => "uploading");
            }
        }
    };

    const run = async (id: string) => {
        onOpen();
        await fetchMapping(id);
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
        const mapping = await fetchMapping(id);
        onClose();
        if (mapping.type === "individual") {
            navigate({ to: "./individual" });
        } else if (mapping.type === "aggregate") {
            navigate({ to: "./aggregate" });
        } else {
            navigate({ to: "./individual" });
        }
    };

    const fetchMapping = async (id: string) => {
        actionApi.edit();
        await db.messages.put({
            message: "Loading previous mapping",
            id: 1,
        });
        const previousMappings = await loadPreviousMapping(
            { engine },
            ["iw-mapping"],
            id,
        );
        let mapping: Partial<IMapping> = {};

        if (!isEmpty(previousMappings)) {
            const { eventStageMapping, categoryColumns, ...rest } =
                previousMappings["iw-mapping"];
            mapping = {
                ...rest,
                eventStageMapping: eventStageMapping
                    ? new Map(Object.entries(eventStageMapping))
                    : new Map(),
                categoryColumns: categoryColumns
                    ? new Map(Object.entries(categoryColumns))
                    : new Map(),
            };
        }

        const {
            programStageMapping,
            attributeMapping,
            organisationUnitMapping,
            optionMapping,
            program,
            remoteProgram,
            enrollmentMapping,
            attributionMapping,
            dataSet,
            remoteDataSet,
        } = await getPreviousProgramMapping(
            { engine },
            mapping,
            async (message: string) => {
                await db.messages.put({
                    message,
                    id: 1,
                });
            },
        );
        mappingApi.set(mapping);
        ouMappingApi.set(organisationUnitMapping);
        attributeMappingApi.set(attributeMapping);
        enrollmentMappingApi.set(enrollmentMapping);
        stageMappingApi.set(programStageMapping);
        attributionMappingApi.set(attributionMapping);
        if (mapping.type === "individual") {
            programApi.set(program);
            optionMappingApi.set(new Map(Object.entries(optionMapping)));
            dhis2ProgramApi.set(remoteProgram);
            if (!isEmpty(program)) {
                mappingApi.updateMany({
                    program: {
                        ...mapping.program,
                        isTracker: program.registration,
                        onlyEnrollOnce: program.onlyEnrollOnce,
                    },
                });
            }

            if (!isEmpty(remoteProgram)) {
                mappingApi.update({
                    attribute: "program",
                    path: "remoteIsTracker",
                    value: remoteProgram.registration,
                });
            }
            if (mapping.dataSource === "go-data") {
                await db.messages.put({
                    message: "Getting Go.Data token",
                    id: 1,
                });
                const token = await getGoDataToken(mapping);
                await db.messages.put({
                    message: "Loading previous go-data data",
                    id: 1,
                });
                const { options, outbreak, tokens, goDataOptions, hierarchy } =
                    await loadPreviousGoData(token, mapping);
                goDataApi.set(outbreak);
                tokensApi.set(new Map(Object.entries(tokens)));
                goDataOptionsApi.set(goDataOptions);
                currentSourceOptionsApi.set(options);
                remoteOrganisationsApi.set(
                    hierarchy.flat().map(({ id, name, parentInfo, code }) => ({
                        id,
                        name: `${[
                            ...parentInfo.map(({ name }) => name),
                            name,
                        ].join("/")}`,
                        code,
                    })),
                );
            }
        } else if (mapping.type === "aggregate") {
            dataSetApi.set(dataSet);
            dhis2DataSetApi.set(remoteDataSet);
        }
        return mapping;
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
                title="Data Exchange"
                open={optionsDialogOpen}
                onOk={handleOptionsOk}
                onCancel={handleOptionsCancel}
                width="75%"
            >
                <SwitchComponent condition={action}>
                    <Case value="previewing">
                        <DataPreview db={db} />
                    </Case>
                    <Case value="uploading">
                        <DataImportSummary db={db} />
                    </Case>
                    <Case default>
                        <ImportExportOptions showFileUpload db={db} />
                    </Case>
                </SwitchComponent>
            </Modal>

            <Modal
                title="Basic Modal"
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Stack>
                    <Text>New name</Text>
                    <Input
                        value={currentName}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            e.persist();
                            setCurrentName(() => e.target.value);
                        }}
                    />
                </Stack>
            </Modal>
        </>
    );
}
