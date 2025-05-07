import { Stack } from "@chakra-ui/react";
import { TreeSelect } from "antd";
import arrayToTree from "array-to-tree";
import { useLiveQuery } from "dexie-react-hooks";
import { orderBy } from "lodash";
import { CQIDexie } from "../db";

const OUTree = ({
    value,
    onChange,
    db,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    db: CQIDexie;
}) => {
    const organisations = useLiveQuery(() => db.organisations.toArray());
    return (
        <Stack spacing="20px" width="400px">
            {organisations !== undefined && (
                <TreeSelect
                    treeData={arrayToTree(
                        orderBy(organisations, "title", "asc"),
                        {
                            parentProperty: "pId",
                        },
                    )}
                    value={value}
                    onChange={(value) => {
                        onChange(value);
                    }}
                    multiple
                />
            )}
        </Stack>
    );
};

export default OUTree;
