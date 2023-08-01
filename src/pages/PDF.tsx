import { Stack } from "@chakra-ui/react";
import React, { useState } from "react";
import { Document, Outline, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";

export default function PDF() {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1); //setting 1 to show fisrt page

    function onDocumentLoadSuccess({
        numPages,
    }: {
        numPages: number | number;
    }) {
        setNumPages(numPages);
        setPageNumber(1);
    }

    function changePage(offset: number) {
        setPageNumber((prevPageNumber) => prevPageNumber + offset);
    }

    function previousPage() {
        changePage(-1);
    }

    function nextPage() {
        changePage(1);
    }

    return (
        <Stack w="100%">
            <Stack mx="auto" flex={1}>
                <Document
                    file="main.pdf"
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="pdf"
                >
                    <Outline />
                    <Stack boxShadow="2xl">
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            scale={1.3}
                            // width={1000}
                        />
                    </Stack>
                </Document>
            </Stack>

            <div>
                <p>
                    Page {pageNumber || (numPages ? 1 : "--")} of{" "}
                    {numPages || "--"}
                </p>
                <button
                    type="button"
                    disabled={pageNumber <= 1}
                    onClick={previousPage}
                >
                    Previous
                </button>
                <button
                    type="button"
                    disabled={pageNumber >= numPages}
                    onClick={nextPage}
                >
                    Next
                </button>
            </div>
        </Stack>
    );
}
