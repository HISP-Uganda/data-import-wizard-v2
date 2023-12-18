import { useDataEngine } from "@dhis2/app-runtime";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios, { AxiosRequestConfig } from "axios";
import {
    Authentication,
    fetchRemote,
    IProgram,
    postRemote,
} from "data-import-wizard-utils";
import { fromPairs, groupBy, isEmpty, map, pick } from "lodash";
import { getOr } from "lodash/fp";
import { useQuery } from "react-query";
import { db } from "./db";
import { closeDialog, setDataSets, setTotalDataSets } from "./Events";
import { tokenApi } from "./pages/program";
import { versionApi } from "./Store";
import { convertDataToURL } from "./utils/utils";

export const useDHIS2Metadata = <TData>(
    resource: string,
    page: number,
    pageSize: number,
    fields: string,
    searchQuery = ""
) => {
    const engine = useDataEngine();

    let params: { [key: string]: any } = {
        page,
        pageSize,
        fields,
        order: "name:ASC",
    };
    let parameters: Array<{ [key: string]: any }> = [params];

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
                param: "filter",
                value: `id:like:${searchQuery}`,
            },
            {
                param: "rootJunction",
                value: "OR",
            },
        ];
    }

    const metadataQuery = {
        data: {
            resource: `${resource}.json`,
            params,
        },
    };
    return useQuery<{ data: Array<Partial<TData>>; total: number }, Error>(
        ["programs", page, pageSize, searchQuery],
        async () => {
            const {
                data: {
                    pager: { total },
                    [resource]: actual,
                },
            }: any = await engine.query(metadataQuery);
            return {
                data: actual,
                total,
            };
        }
    );
};

export const useInitials = () => {
    const engine = useDataEngine();
    const query = {
        info: {
            resource: "system/info",
        },
        organisationUnits: {
            resource: "organisationUnits.json",
            params: {
                fields: "id,name,path,leaf",
                level: 1,
            },
        },
        levels: {
            resource: "filledOrganisationUnitLevels.json",
            params: {
                fields: "id,level~rename(value),name~rename(label)",
            },
        },
        groups: {
            resource: "organisationUnitGroups.json",
            params: {
                fields: "id~rename(value),name~rename(label)",
            },
        },
    };

    return useQuery<boolean, Error>(["initials"], async () => {
        const {
            info: { version },
            organisationUnits: { organisationUnits },
            levels: organisationUnitLevels,
            groups: { organisationUnitGroups },
        }: any = await engine.query(query);
        const versionNumbers = String(version).split(".");
        const availableUnits = organisationUnits.map((unit: any) => {
            return {
                id: unit.id,
                pId: unit.pId || "",
                value: unit.id,
                title: unit.name,
                key: unit.id,
                isLeaf: unit.leaf,
            };
        });
        await db.organisations.bulkPut(availableUnits);
        await db.levels.bulkPut(organisationUnitLevels);
        await db.groups.bulkPut(organisationUnitGroups);
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

export const loadProgram = async <T>({
    resource,
    engine,
    id,
    fields,
}: {
    engine: any;
    resource: string;
    id: string;
    fields: string;
}) => {
    const query = {
        data: {
            resource: `${resource}/${id}.json`,
            params: {
                fields,
            },
        },
    };

    const { data }: any = await engine.query(query);

    return data as Partial<T>;
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

export const getDHIS2SingleResource = async <T>({
    isCurrentDHIS2,
    params,
    resource,
    engine,
    auth,
}: Partial<{
    params: { [key: string]: string };
    resource: string;
    isCurrentDHIS2?: boolean;
    resourceKey: string;
    auth?: Partial<Authentication>;
    engine: any;
}>) => {
    if (isCurrentDHIS2 && resource) {
        const { data }: any = await engine.query({
            data: {
                resource,
                params,
            },
        });

        const { pager } = data;
        let total = params?.pageSize || 10;

        if (pager && pager.total) {
            total = pager.total;
        }

        return data as Partial<T>;
    }

    if (auth) {
        let config: AxiosRequestConfig = {
            baseURL: auth.url,
        };
        if (auth.username && auth.password) {
            config = {
                ...config,
                auth: {
                    username: auth.username,
                    password: auth.password,
                },
            };
        }
        const api = axios.create(config);

        if (resource) {
            const { data } = await api.get<Partial<T>>(resource, {
                params,
            });
            return data;
        }
    }
    return {} as Partial<T>;
};

export const getDHIS2Resource = async <T>({
    isCurrentDHIS2,
    params,
    resource,
    resourceKey,
    engine,
    auth,
}: Partial<{
    params: { [key: string]: string };
    resource: string;
    isCurrentDHIS2?: boolean;
    resourceKey: string;
    auth?: Partial<Authentication>;
    engine: any;
    callback: () => void;
}>) => {
    if (isCurrentDHIS2 && resource && resourceKey) {
        const { data }: any = await engine.query({
            data: {
                resource,
                params,
            },
        });

        const { pager } = data;
        let total = params?.pageSize || 10;

        if (pager && pager.total) {
            total = pager.total;
        }

        return getOr<T[]>([], resourceKey, data);
    }
    if (isCurrentDHIS2 && resource) {
        const { data }: any = await engine.query({
            data: {
                resource,
                params,
            },
        });
        return data as Array<T>;
    }
    if (auth) {
        let config: AxiosRequestConfig<T> = {
            baseURL: auth.url,
        };
        if (auth.username && auth.password) {
            config = {
                ...config,
                auth: {
                    username: auth.username,
                    password: auth.password,
                },
            };
        }
        const api = axios.create(config);

        if (resource && resourceKey) {
            const { data } = await api.get<{ [key: string]: T[] }>(resource, {
                params,
            });
            return data[resourceKey];
        }
        if (resource) {
            const { data } = await api.get<T[]>(resource, {
                params,
            });
            return data;
        }
    }
    return [];
};

export const useDHIS2Resources = <T>({
    page,
    pageSize,
    resource,
    q,
    isCurrentDHIS2,
    resourceKey,
    derive = true,
    auth,
}: {
    page: number;
    pageSize: number;
    resource: string;
    q: string;
    isCurrentDHIS2?: boolean | undefined;
    derive?: boolean;
    resourceKey?: string;
    auth?: Partial<Authentication> | undefined;
}) => {
    const engine = useDataEngine();
    let rKey = resourceKey;
    if (!rKey && derive) {
        rKey = resource.split(".")[0];
    }
    let params: { [key: string]: any } = {
        page,
        pageSize,
        fields: "id,name",
        order: "name:ASC",
    };

    if (q) {
        params = {
            ...params,
            filter: `identifiable:token:${q}`,
        };
    }

    return useQuery<T[], Error>(
        [resource, page, pageSize, q, isCurrentDHIS2],
        async () => {
            const data = await getDHIS2Resource<T>({
                isCurrentDHIS2,
                resource,
                params,
                engine,
                resourceKey: rKey,
                auth,
            });

            return data;
        }
    );
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
                param: "filter",
                value: `id:like:${searchQuery}`,
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
            return {
                programs: programs.map((p: Partial<IProgram>) => ({
                    ...p,
                    programType:
                        p.programType === "WITH_REGISTRATION"
                            ? "Tracker"
                            : "Event",
                })),
                total,
            };
        }
    );
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

export const useRemoteGet = <T, V>(
    fields: Partial<{
        authentication: Partial<Authentication> | undefined;
        url: string;
        getToken: boolean;
        tokenGenerationURL: string;
        tokenGenerationUsernameField: string;
        tokenGenerationPasswordField: string;
        tokenName: string;
        tokenField: keyof V;
        addTokenTo: "headers" | "params";
    }> = {
        tokenGenerationUsernameField: "username",
        tokenGenerationPasswordField: "password",
        getToken: false,
        addTokenTo: "params",
        tokenName: "access_token",
    }
) => {
    const { keys } = makeQueryKeys(fields.authentication?.params);

    return useQuery<T | undefined, Error>(
        ["remote", fields.url, keys],
        async () => {
            if (
                fields.getToken &&
                fields.tokenGenerationURL &&
                fields.authentication?.username &&
                fields.authentication.password &&
                fields.tokenField &&
                fields.tokenGenerationUsernameField &&
                fields.tokenGenerationPasswordField
            ) {
                const {
                    params,
                    basicAuth,
                    hasNextLink,
                    headers,
                    password,
                    username,
                    ...rest
                } = fields.authentication;
                const {
                    tokenGenerationUsernameField,
                    tokenGenerationPasswordField,
                } = fields;
                const data = await postRemote<V>(
                    rest,
                    fields.tokenGenerationURL,
                    {
                        [tokenGenerationUsernameField]:
                            fields.authentication.username,
                        [tokenGenerationPasswordField]:
                            fields.authentication.password,
                    }
                );

                if (data) {
                    const token = data[fields.tokenField];
                    tokenApi.set(token as string);
                    let currentAuth: Partial<Authentication> = rest;
                    if (fields.addTokenTo === "params") {
                        currentAuth = {
                            ...currentAuth,
                            basicAuth: false,
                            params: {
                                ...params,
                                auth: {
                                    param: fields.tokenName,
                                    value: token as string,
                                },
                            },
                            headers,
                        };
                    } else {
                        currentAuth = {
                            ...currentAuth,
                            basicAuth: false,
                            headers: {
                                ...headers,
                                auth: {
                                    param: fields.tokenName,
                                    value: token as string,
                                },
                            },
                            params,
                        };
                    }
                    return await fetchRemote<T>(currentAuth, fields.url);
                }
            }
            if (fields.authentication && fields.url) {
                return await fetchRemote<T>(fields.authentication, fields.url);
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
                fields: "organisationUnits[id,code,name,parent[name,parent[name,parent[name,parent[name,parent[name]]]]]],programStages[id,name,code,programStageDataElements[id,name,dataElement[id,name,code]]],programTrackedEntityAttributes[id,mandatory,valueType,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,code,unique,generated,pattern,confidential,valueType,optionSetValue,displayFormName,optionSet[id,name,options[id,name,code]]]]",
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

export const getDHIS2Resource2 = async <T>({
    params,
    resource,
    engine,
    resourceKey,
    auth,
    isCurrentDHIS2,
}: Partial<{
    params: { [key: string]: string };
    resource: string;
    engine: any;
    isCurrentDHIS2?: boolean;
    resourceKey: string;
    auth?: Partial<Authentication>;
}>) => {
    if (isCurrentDHIS2 && resource) {
        let query: any = {
            data: {
                resource,
            },
        };
        if (!isEmpty(params)) {
            query = {
                data: { resource, params },
            };
        }
        const { data }: any = await engine.query(query);
        return {
            pager: getOr<{
                total: number;
                page: number;
                pageSize: number;
                pageCount: number;
            }>(
                { total: 0, page: 1, pageSize: 50, pageCount: 1 },
                "pager",
                data
            ),
            data: getOr<T[]>([], resourceKey || resource.split(".")[0], data),
        };
    }
    if (auth && resource) {
        let config: AxiosRequestConfig = {
            baseURL: auth.url,
        };
        if (auth.username && auth.password) {
            config = {
                ...config,
                auth: {
                    username: auth.username,
                    password: auth.password,
                },
            };
        }
        const api = axios.create(config);
        const { data } = await api.get(resource, {
            params,
        });
        return {
            pager: getOr<{
                total: number;
                page: number;
                pageSize: number;
                pageCount: number;
            }>(
                { total: 0, page: 1, pageSize: 50, pageCount: 1 },
                "pager",
                data
            ),
            data: getOr<T[]>([], resourceKey || resource.split(".")[0], data),
        };
    }
    return {
        data: [],
        pager: { total: 0, page: 1, pageSize: 50, pageCount: 1 },
    };
};

export const useInfiniteDHIS2Query = <T>({
    search,
    resource,
    isCurrentDHIS2,
    auth,
    resourceKey,
}: {
    search: string;
    resource: string;
    isCurrentDHIS2?: boolean | undefined;
    resourceKey?: string;
    auth?: Partial<Authentication> | undefined;
}) => {
    const engine = useDataEngine();
    return useInfiniteQuery<
        {
            pager: {
                total: number;
                page: number;
                pageSize: number;
                pageCount: number;
            };
            data: Array<T>;
        },
        Error
    >(
        [resource, search],
        async ({ pageParam = 1 }) => {
            let params: { [key: string]: any } = {
                fields: "id,name",
                page: pageParam,
                paging: true,
                totalPages: true,
            };
            if (search) {
                params = { ...params, filter: `identifiable:token:${search}` };
            }

            const data = await getDHIS2Resource2<T>({
                resource,
                params,
                engine,
                isCurrentDHIS2,
                auth,
                resourceKey,
            });
            return data;
        },
        {
            getPreviousPageParam: (firstPage) =>
                firstPage.pager.page ?? undefined,
            getNextPageParam: (lastPage) => {
                if (lastPage.pager.page < lastPage.pager.pageCount) {
                    return lastPage.pager.page + 1;
                }
                return undefined;
            },
        }
    );
};

export const makeSQLQuery = async (
    engine: any,
    id: string,
    query: string,
    name: string
) => {
    const sqlQuery = {
        description: name,
        type: "QUERY",
        id,
        sqlQuery: query,
        sharing: {
            public: "rwrw----",
        },
        name,
        cacheStrategy: "NO_CACHE",
    };

    const mutation: any = {
        type: "create",
        resource: `metadata`,
        data: { sqlViews: [sqlQuery] },
    };
    await engine.mutate(mutation);
};

export const useSQLViewMetadata = (program: string, mapping: string) => {
    const engine = useDataEngine();
    return useQuery<any, Error>(
        ["sql-view-metadata", program, mapping],
        async () => {
            await makeSQLQuery(
                engine,
                mapping,
                `select * from analytics_event_${program.toLowerCase()}`,
                mapping
            );

            const metadataQuery = {
                data: {
                    resource: `sqlViews/${mapping}/data.json`,
                },
            };

            const { data }: any = await engine.query(metadataQuery);

            let {
                listGrid: { headers, rows },
            } = data;

            const withIds = headers.flatMap((h: any) => {
                if (
                    h.name.length === 11 &&
                    ["lastupdated", "teigeometry"].indexOf(h.name) === -1
                ) {
                    return h.name;
                }
                return [];
            });

            if (withIds.length > 0) {
                const query = {
                    data2: {
                        resource: "metadata",
                        params: {
                            filter: `id:in:[${withIds.join(",")}]`,
                        },
                    },
                };
                const {
                    data2: { system, ...rest },
                }: any = await engine.query(query);

                const allObjects = fromPairs(
                    Object.values(rest).flatMap((a: any) =>
                        a.map(({ id, name }: any) => [id, name])
                    )
                );

                headers = headers.map((h: any) => {
                    if (withIds.indexOf(h.name) !== -1) {
                        return {
                            ...h,
                            name: allObjects[h.name] ?? h.name,
                            column: allObjects[h.name] ?? h.name,
                        };
                    }
                    return h;
                });
            }
            return rows.map((row: string[]) =>
                fromPairs(row.map((r, index) => [headers[index].name, r]))
            );
        }
    );
};
