import { Text } from "@chakra-ui/react";
export default function Superscript({
    value,
    fontSize = "12px",
    color = "white",
    h = "25px",
    bg = "green",
}: {
    value: number;
    h?: string;
    bg?: string;
    fontSize?: string;
    color?: string;
}) {
    return (
        <sup>
            <Text
                fontSize={fontSize}
                color={color}
                borderRadius="50%"
                bg={bg}
                h={h}
                lineHeight={h}
                mb="15px"
                ml="-6px"
                w={h}
            >
                {value < 100 ? value : "99+"}
            </Text>
        </sup>
    );
}
