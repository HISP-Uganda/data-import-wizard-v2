import React, { useState } from "react";
import { MdAdd } from "react-icons/md";
import cn from "classnames";

import "./fab.css";
import { Stack, Text } from "@chakra-ui/react";

export default function FAB({
    actions,
}: {
    actions: Array<{
        label: string;
        icon: React.ReactNode;
        onClick: () => void;
    }>;
}) {
    const [open, setOpen] = useState(false);
    // Set open state to true if user hover over "ul" element
    const mouseEnter = () => setOpen(true);

    // Set open state to false if user hover out of "ul" element
    const mouseLeave = () => setOpen(false);
    return (
        <ul
            className="fab-container"
            onMouseEnter={mouseEnter}
            onMouseLeave={mouseLeave}
        >
            <li className="fab-button">
                <Stack direction="row" alignItems="center">
                    <MdAdd />
                    <Text
                        textTransform="uppercase"
                        color="white"
                        // fontWeight="semibold"
                    >
                        New Mapping
                    </Text>
                </Stack>
            </li>
            {actions.map((action, index) => (
                <li
                    style={{ transitionDelay: `${index * 25}ms` }}
                    className={cn("fab-action", { open })}
                    key={action.label}
                    onClick={action.onClick}
                >
                    {action.icon}
                    {action.label}
                    <span className="tooltip">{action.label}</span>
                </li>
            ))}
        </ul>
    );
}
