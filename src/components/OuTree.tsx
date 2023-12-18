import { Stack } from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { Tree } from "antd";
import arrayToTree from "array-to-tree";
import { useLiveQuery } from "dexie-react-hooks";
import { flatten } from "lodash";
import React, { useState } from "react";
import { db } from "../db";

const OUTree = ({
    value,
    onChange,
}: {
    value: string[];
    onChange: (value: string[]) => void;
}) => {
    const engine = useDataEngine();
    const organisations = useLiveQuery(() => db.organisations.toArray());
    const expandedKeys = useLiveQuery(() => db.expandedKeys.get("1"));
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
    const [checkedKeys, setCheckedKeys] = useState<
        { checked: React.Key[]; halfChecked: React.Key[] } | React.Key[]
    >(() => {
        return { checked: value, halfChecked: [] };
    });

    const onLoadData = async ({ id, children }: any) => {
        if (children) {
            return;
        }
        try {
            const {
                units: { organisationUnits },
            }: any = await engine.query({
                units: {
                    resource: "organisationUnits.json",
                    params: {
                        filter: `id:in:[${id}]`,
                        paging: "false",
                        order: "shortName:desc",
                        fields: "children[id,name,path,leaf]",
                    },
                },
            });
            const found = organisationUnits.map((unit: any) => {
                return unit.children
                    .map((child: any) => {
                        return {
                            id: child.id,
                            pId: id,
                            value: child.id,
                            title: child.name,
                            key: child.id,
                            isLeaf: child.leaf,
                        };
                    })
                    .sort((a: any, b: any) => {
                        if (a.title > b.title) {
                            return 1;
                        }
                        if (a.title < b.title) {
                            return -1;
                        }
                        return 0;
                    });
            });
            await db.organisations.bulkPut(flatten(found));
        } catch (e) {
            console.log(e);
        }
    };
    const onExpand = async (expandedKeysValue: React.Key[]) => {
        await db.expandedKeys.put({
            id: "1",
            name: expandedKeysValue.join(","),
        });
        setAutoExpandParent(false);
    };

    const onCheck = async (
        checkedKeysValue:
            | { checked: React.Key[]; halfChecked: React.Key[] }
            | React.Key[]
    ) => {
        let allChecked = [];
        if (Array.isArray(checkedKeysValue)) {
            allChecked = checkedKeysValue;
        } else {
            allChecked = checkedKeysValue.checked;
        }
        setCheckedKeys(checkedKeysValue);
        onChange(allChecked.map((val) => String(val)));
    };
    return (
        <Stack spacing="20px">
            {organisations !== undefined && (
                <Stack direction="row">
                    <Tree
                        checkable
                        onExpand={onExpand}
                        checkStrictly
                        expandedKeys={
                            expandedKeys !== undefined
                                ? expandedKeys.name.split(",")
                                : []
                        }
                        autoExpandParent={autoExpandParent}
                        onCheck={onCheck}
                        checkedKeys={checkedKeys}
                        loadData={onLoadData}
                        style={{
                            maxHeight: "400px",
                            overflow: "auto",
                            fontSize: "18px",
                        }}
                        treeData={arrayToTree(organisations, {
                            parentProperty: "pId",
                        })}
                    />
                </Stack>
            )}
        </Stack>
    );
};

export default OUTree;
