import {
    Stack
} from "@chakra-ui/react";
import {
    InputField,
    Table
} from "@dhis2/ui"
import {useStore} from "effector-react";
import {$iStore} from "../../stores/Store";
const Step1 = () =>{
        const store = useStore($iStore);
        return (
            <Stack>
                {/*<InputField*/}
                {/*    label="Search"*/}
                {/*    type="text"*/}
                {/*    fullWidth*/}
                {/*    value={store.search}*/}
                {/*    onChange={(value) => store.setSearch(value, "step1")}*/}
                {/*/>*/}
                {/*<Table*/}
                {/*    columns={["displayName", "programType", "lastUpdated"]}*/}
                {/*    rows={store.programs}*/}
                {/*    contextMenuActions={store.multipleCma}*/}
                {/*    primaryAction={store.executeEditIfAllowed}*/}
                {/*/>*/}
                {/*<TablePagination*/}
                {/*    component="div"*/}
                {/*    count={store.totalPrograms}*/}
                {/*    rowsPerPageOptions={[5, 10, 25, 50, 100]}*/}
                {/*    rowsPerPage={store.paging["step1"]["rowsPerPage"]}*/}
                {/*    page={store.paging["step1"]["page"]}*/}
                {/*    backIconButtonProps={{*/}
                {/*        "aria-label": "Previous Page",*/}
                {/*    }}*/}
                {/*    nextIconButtonProps={{*/}
                {/*        "aria-label": "Next Page",*/}
                {/*    }}*/}
                {/*    onChangePage={store.handleChangeElementPage("step1")}*/}
                {/*    onChangeRowsPerPage={store.handleChangeElementRowsPerPage(*/}
                {/*        "step1"*/}
                {/*    )}*/}
                {/*/>*/}
                {/*<Progress*/}
                {/*    open={store.dialogOpen}*/}
                {/*    onClose={store.closeDialog}*/}
                {/*    message={"Fetching programs"}*/}
                {/*/>*/}
            </Stack>
        );
}

export default Step1;