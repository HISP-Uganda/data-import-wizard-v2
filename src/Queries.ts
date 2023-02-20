import { useDataEngine } from "@dhis2/app-runtime";
import axios, { AxiosRequestConfig } from "axios";
import { useQuery } from "react-query";


export const useInitials = () =>{
    const engine = useDataEngine();

    return useQuery<any, Error>(["initials"], async () => {

    })
}
