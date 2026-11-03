import "@testing-library/jest-dom/vitest";
import { MotionGlobalConfig } from "motion/react";

// Tests check behaviour, not motion: finish every animation instantly.
MotionGlobalConfig.skipAnimations = true;
