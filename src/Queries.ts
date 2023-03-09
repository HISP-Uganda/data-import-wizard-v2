import { useDataEngine } from "@dhis2/app-runtime";
import { fromPairs, groupBy, map, pick } from "lodash";
import { useQuery } from "react-query";
import { closeDialog, setDataSets, setTotalDataSets } from "./Events";
import { IProgram } from "./pages/program/Interfaces";
import { convertDataToURL } from "./utils/utils";

export const useInitials = () => {
    const engine = useDataEngine();

    const query = {
        mappings: {
            resource: "/dataStore/iw-mappings",
        },
        aggregate: {
            resource: "/dataStore/iw-aggregate",
        },
        schedules: {
            resource: "/dataStore/iw-schedules",
        },
    };

    return useQuery<any, Error>(["initials"], async () => {
        const { mappings, aggregate, schedules }: any = await engine.query(
            query
        );
        console.log(JSON.stringify(mappings, null, 2));
    });
};
export const useNamespace = (namespace: string) => {
    const engine = useDataEngine();
    const namespaceQuery = {
        namespaceKeys: {
            resource: `dataStore/${namespace}`,
        },
    };
    return useQuery<any, Error>(["namespaces", namespace], async () => {
        const { namespaceKeys }: any = await engine.query(namespaceQuery);
        const query: any = fromPairs(
            namespaceKeys.map((n: string) => [
                n,
                {
                    resource: `dataStore/${namespace}/${n}`,
                },
            ])
        );
        return await engine.query(query);
    });
};

export const useNamespaceKey = (namespace: string, key: string) => {
    const engine = useDataEngine();
    const namespaceQuery = {
        storedValue: {
            resource: `dataStore/${namespace}/${key}`,
        },
    };
    return useQuery<boolean, Error>(["namespace", namespace, key], async () => {
        // const { storedValue }: any = await engine.query(namespaceQuery);
        // do something with storedValue
        return true;
    });
};

export const usePrograms = (
    page: number,
    pageSize: number,
    searchQuery = ""
) => {
    const engine = useDataEngine();
    let params: { [key: string]: any } = {
        page,
        pageSize,
        fields: "id,name,displayName,lastUpdated,programType",
        order: "name:ASC",
    };
    let parameters = [params];
    if (searchQuery !== "") {
        parameters = [
            ...parameters,
            {
                param: "filter",
                value: `name:ilike:${searchQuery}`,
            },
            {
                param: "filter",
                value: `code:like:${searchQuery}`,
            },
            {
                param: "rootJunction",
                value: "OR",
            },
        ];
    }
    const stringParams = convertDataToURL(parameters);
    const programsQuery = {
        data: {
            resource: `programs.json?${stringParams}`,
            params: params,
        },
    };

    return useQuery<{ programs: Partial<IProgram>[]; total: number }, Error>(
        ["programs", page, pageSize, searchQuery],
        async () => {
            const {
                data: {
                    pager: { total },
                    programs,
                },
            }: any = await engine.query(programsQuery);
            return { programs, total };
        }
    );
};

export const useProgram = (id: string) => {
    const engine = useDataEngine();

    const programQuery = {
        data: {
            resource: `programs/${id}.json`,
        },
    };

    return useQuery<{ programs: Partial<IProgram> }, Error>(
        ["programs", id],
        async () => {
            const { data }: any = await engine.query(programQuery);
            return data;
        }
    );
};

export const useDataSets = (
    page: number,
    pageSize: number,
    searchQuery = ""
) => {
    let params: { [key: string]: any } = {
        page,
        pageSize,
    };
    let parameters = [params];
    if (searchQuery !== "") {
        parameters = [
            ...parameters,
            {
                param: "filter",
                value: `name:ilike:${searchQuery}`,
            },
            {
                param: "filter",
                value: `code:like:${searchQuery}`,
            },
            {
                param: "rootJunction",
                value: "OR",
            },
        ];
    }
    const stringParams = convertDataToURL(parameters);
    const dataSetsQuery = {
        dataSets: {
            resource: `dataSets.json?${stringParams}`,
            params: {
                fields:
                    "id,name,code,periodType,categoryCombo[id,name,categories[id,name,code,categoryOptions[id,name,code]]," +
                    "categoryOptionCombos[id,name,categoryOptions[id,name]]],dataSetElements[dataElement[id,name,code,valueType," +
                    "dataSetElements[dataSet,categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]," +
                    "categoryCombo[id,name,isDefault,categoryOptionCombos[id,name]]]],organisationUnits[id,name,code]",
                order: "name:ASC",
            },
        },
    };
    const engine = useDataEngine();

    return useQuery<any, Error>(
        ["datasets", page, pageSize, searchQuery],
        async () => {
            const {
                dataSets: {
                    pager: { total: totalDataSets },
                    dataSets,
                },
            }: any = await engine.query(dataSetsQuery);
            setTotalDataSets(totalDataSets);

            const des = dataSets.map((dataSet: any) => {
                const processed = dataSet.dataSetElements.map(
                    (dataSetElement: any) => {
                        if (
                            !dataSetElement.dataElement.categoryCombo.isDefault
                        ) {
                            const newCombo =
                                dataSetElement.dataElement.dataSetElements.find(
                                    (dse: any) => {
                                        return (
                                            dse.dataSet.id === dataSet.id &&
                                            dse.categoryCombo &&
                                            dse.categoryCombo.isDefault
                                        );
                                    }
                                );

                            if (newCombo) {
                                dataSetElement = {
                                    ...dataSetElement,
                                    dataElement: {
                                        ...dataSetElement.dataElement,
                                        categoryCombo: newCombo.categoryCombo,
                                    },
                                };
                            }
                        }
                        return dataSetElement;
                    }
                );

                dataSet = { ...dataSet, dataSetElements: processed };

                const groupedDataElements = groupBy(
                    dataSet["dataSetElements"],
                    "dataElement.categoryCombo.id"
                );
                const forms = map(groupedDataElements, (v) => {
                    const dataElements = v.map((des) => {
                        return {
                            id: des.dataElement.id,
                            name: des.dataElement.name,
                            code: des.dataElement.code,
                            valueType: des.dataElement.valueType,
                        };
                    });
                    const categoryOptionCombos =
                        v[0]["dataElement"]["categoryCombo"][
                            "categoryOptionCombos"
                        ];
                    const name = v[0]["dataElement"]["categoryCombo"]["name"];
                    return {
                        name,
                        dataElements,
                        categoryOptionCombos,
                    };
                });
                const organisationUnits = dataSet["organisationUnits"];
                setDataSets(des);
                setTotalDataSets(totalDataSets);
                closeDialog();
                return {
                    ...pick(dataSet, [
                        "id",
                        "name",
                        "code",
                        "periodType",
                        "categoryCombo",
                    ]),
                    organisationUnits,
                    forms,
                };
                return dataSets;
            });
        }
    );
};

export const useDataElements = () => {};

export const useUserGroups = () => {};
