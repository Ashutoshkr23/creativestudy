import type { ComponentType } from "react";

// Registry of bespoke interactive scenes. Signature games from the static
// chapters (balance simulator, mind reader, quadrilateral toy, ...) get ported
// as React components and registered here, then referenced from content
// modules as { type: "custom", component: "<name>" }.
export const customComponents: Record<string, ComponentType<Record<string, unknown>>> = {};
