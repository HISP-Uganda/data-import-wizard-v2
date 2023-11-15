self.addEventListener("message", (event) => {
    const file = event.data.file;

    if (file) {
        uploadFile(file);
    }
});

function uploadFile(file: File) {
    const chunkSize = 1024 * 1024; // Set your desired chunk size
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    // Simulate file upload in chunks
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);

        // Simulate an asynchronous upload operation
        setTimeout(() => {
            const progress = Math.round(((i + 1) / totalChunks) * 100);
            self.postMessage({ progress });

            if (i === totalChunks - 1) {
                self.postMessage({ result: "Upload Complete" });
            }
        }, 1000); // Simulate a 1-second delay
    }
}

export {};
