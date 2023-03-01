import {Spinner, Stack, Text} from "@chakra-ui/react";
import {useNamespace} from "../../Queries";

const Step2 = () =>{
    const {isLoading, isSuccess, data, isError,  error} = useNamespace("iw-mappings");
    return (
        <Stack>
            {isLoading && <Spinner/>}
            {isSuccess && <Text>{JSON.stringify(data, null, 2)}</Text> }
        </Stack>
    );
}

export default Step2;