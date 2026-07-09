import type { ComponentType } from "react";
import { IndicatorLab } from "./IndicatorLab";
import { PhSlider } from "./PhSlider";
import { NeutralisationMixer } from "./NeutralisationMixer";
import { RescueMission } from "./RescueMission";
import { SaltNameFactory } from "./SaltNameFactory";
import { ThreeBottlesPuzzle } from "./ThreeBottlesPuzzle";
import { UndoLab } from "./UndoLab";
import { HeatLab } from "./HeatLab";
import { ReactionLab } from "./ReactionLab";
import { RustLab } from "./RustLab";
import { CrystalLab } from "./CrystalLab";

// Registry of bespoke interactive scenes. Content modules reference these by
// name as { type: "custom", component: "<name>" }.
export const customComponents: Record<string, ComponentType<Record<string, unknown>>> = {
  "indicator-lab": IndicatorLab,
  "ph-slider": PhSlider,
  "neutralisation-mixer": NeutralisationMixer,
  "rescue-mission": RescueMission,
  "salt-name-factory": SaltNameFactory,
  "three-bottles": ThreeBottlesPuzzle,
  "undo-lab": UndoLab,
  "heat-lab": HeatLab,
  "reaction-lab": ReactionLab,
  "rust-lab": RustLab,
  "crystal-lab": CrystalLab,
};
