import { useDataEngine } from "@dhis2/app-runtime";
import { AxiosInstance } from "axios";
import { fromPairs, groupBy, map, pick } from "lodash";
import { useQuery } from "react-query";
import { closeDialog, setDataSets, setTotalDataSets } from "./Events";
import { IProgram } from "./pages/program/Interfaces";
import { versionApi } from "./Store";
import { convertDataToURL } from "./utils/utils";

export const useInitials = () => {
    const engine = useDataEngine();
    const query = {
        info: {
            resource: "system/info",
        },
    };

    return useQuery<boolean, Error>(["initials"], async () => {
        const {
            info: { version },
        }: any = await engine.query(query);
        const versionNumbers = String(version).split(".");
        versionApi.set(Number(versionNumbers[1]));
        return true;
    });
};
export const useNamespace = <IData>(namespace: string) => {
    const engine = useDataEngine();
    const namespaceQuery = {
        namespaceKeys: {
            resource: `dataStore/${namespace}`,
        },
    };
    return useQuery<IData[], Error>(["namespaces", namespace], async () => {
        try {
            const { namespaceKeys }: any = await engine.query(namespaceQuery);
            const query: any = fromPairs(
                namespaceKeys.map((n: string) => [
                    n,
                    {
                        resource: `dataStore/${namespace}/${n}`,
                    },
                ])
            );
            const response: any = await engine.query(query);
            return Object.values<IData>(response);
        } catch (error) {
            console.log(error);
        }
        return [];
    });
};

export const loadPreviousMapping = async (
    engine: any,
    namespaces: string[],
    namespaceKey: string
) => {
    const query = namespaces.map((namespace) => [
        namespace,
        {
            resource: `dataStore/${namespace}/${namespaceKey}`,
        },
    ]);
    return await engine.query(fromPairs(query));
};

export const loadProgram = async (engine: any, id: string) => {
    const query = {
        data: {
            resource: `programs/${id}.json`,
            params: {
                fields: "trackedEntityType,organisationUnits[id,code,name],programStages[id,repeatable,name,code,programStageDataElements[id,compulsory,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
            },
        },
    };

    const { data }: any = await engine.query(query);

    return data as Partial<IProgram>;
};

export const useNamespaceKey = <IData>(namespace: string, key: string) => {
    const engine = useDataEngine();
    const namespaceQuery = {
        storedValue: {
            resource: `dataStore/${namespace}/${key}`,
        },
    };
    return useQuery<IData, Error>(["namespace", namespace, key], async () => {
        const { storedValue } = await engine.query(namespaceQuery);
        return storedValue as IData;
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
export const fetchRemote = async <IData>(
    api: AxiosInstance | undefined,
    url: string = "",
    params?: URLSearchParams
) => {
    if (api && params) {
        const { data } = await api.get<IData>(url, { params });
        return data;
    }
    if (api) {
        const { data } = await api.get<IData>(url);
        return data;
    }
    return undefined;
};

export const makeQueryKeys = (params?: {
    [key: string]: Partial<{
        param: string;
        value: string;
        forUpdates: boolean;
    }>;
}) => {
    if (params) {
        let allParams = new URLSearchParams();
        Object.values(params).forEach(({ param, value }) => {
            if (param && value) {
                allParams.append(param, value);
            }
        });
        const keys = Array.from(allParams.entries())
            .map(([key, value]) => `${key}${value}`)
            .join("");
        return { params: allParams, keys };
    }
    return { params: undefined, keys: "" };
};

export const useRemoteGet = <IData>(
    api: AxiosInstance | undefined,
    url: string = "",
    queryParams?: {
        [key: string]: Partial<{
            param: string;
            value: string;
            forUpdates: boolean;
        }>;
    }
) => {
    const { keys, params } = makeQueryKeys(queryParams);
    return useQuery<IData | undefined, Error>(
        ["remote", url, keys],
        async () => {
            if (api && url) {
                return await fetchRemote<IData>(api, url, params);
            }
            return undefined;
        }
    );
};

export const useProgram = (id: string | undefined) => {
    const engine = useDataEngine();

    const programQuery = {
        data: {
            resource: `programs/${id}.json`,
            params: {
                fields: "organisationUnits[id,code,name],programStages[id,name,code,programStageDataElements[id,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,valueType,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
            },
        },
    };

    return useQuery<Partial<IProgram>, Error>(["programs", id], async () => {
        if (id) {
            const { data }: any = await engine.query(programQuery);
            return data;
        }
        return {};
    });
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
