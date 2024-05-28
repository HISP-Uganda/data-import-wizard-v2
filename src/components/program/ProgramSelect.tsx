import { Box, Stack } from "@chakra-ui/react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { IProgram } from "data-import-wizard-utils";
import { useStore } from "effector-react";
import { $mapping } from "../../Store";
import { usePrograms } from "../../Queries";
import Loader from "../Loader";
import Progress from "../Progress";

const ProgramSelect = ({
    onProgramSelect,
    isOpen,
    onClose,
    onOpen,
    message,
}: {
    onProgramSelect: (id?: string) => Promise<void>;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    message: string;
}) => {
    const { isLoading, isError, isSuccess, error, data } = usePrograms(1, 100);
    const mapping = useStore($mapping);

    const columns: ColumnsType<Partial<IProgram>> = [
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Program Type",
            dataIndex: "programType",
            key: "programType",
        },
    ];

    return (
        <Stack>
            <Box m="auto" w="100%">
                <Box
                    overflow="auto"
                    whiteSpace="nowrap"
                    h="calc(100vh - 350px)"
                >
                    {isLoading && (
                        <Loader message="Loading DHIS2 programs..." />
                    )}
                    {isSuccess && (
                        <Table
                            columns={columns}
                            dataSource={data.programs}
                            rowKey="id"
                            rowSelection={{
                                type: "radio",
                                selectedRowKeys: mapping.program?.program
                                    ? [mapping.program?.program]
                                    : [],

                                onSelect: (record) =>
                                    onProgramSelect(record.id),
                            }}
                        />
                    )}
                    {isError && JSON.stringify(error)}
                </Box>
            </Box>

            <Progress
                onClose={onClose}
                isOpen={isOpen}
                message={message}
                onOpen={onOpen}
            />
        </Stack>
    );
};

export default ProgramSelect;
