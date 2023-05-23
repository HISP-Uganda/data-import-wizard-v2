import { ChangeEvent } from "react";
import { dataApi } from "../pages/program/Store";

export default function FileUpload() {
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            let fileReader = new FileReader();
            const file = e.target.files[0];
            fileReader.onload = async (e) => {
                const result = e.target?.result;
                if (result) {
                    dataApi.changeData(JSON.parse(String(result)));
                }
            };
            fileReader;
            fileReader.readAsText(file);
        }
    };
    return (
        <div>
            <input
                type="file"
                id="input"
                multiple
                onChange={handleFileChange}
            />
        </div>
    );
}
