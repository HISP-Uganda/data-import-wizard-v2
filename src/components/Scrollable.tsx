import React, { useEffect, useRef } from "react";
import { Box, useDimensions } from "@chakra-ui/react";
import type { TypographyProps } from "@chakra-ui/react";

export default function Scrollable({
    children,
    whiteSpace = "nowrap",
    height,
    width,
}: {
    children: React.ReactNode;
    whiteSpace?: TypographyProps["whiteSpace"];
    height?: string;
    width?: string;
}) {
    const elementRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(elementRef, true);
    return (
        <Box h="100%" w="100%" ref={elementRef}>
            <Box
                overflow="auto"
                h={
                    dimensions && dimensions.borderBox.height !== 0
                        ? `${dimensions && dimensions.borderBox.height}px`
                        : height
                }
                w={
                    dimensions && dimensions.borderBox.width !== 0
                        ? `${dimensions && dimensions.borderBox.width}px`
                        : width
                }
                whiteSpace={whiteSpace}
            >
                {children}
            </Box>
        </Box>
    );
}
