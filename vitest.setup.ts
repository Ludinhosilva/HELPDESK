import "@testing-library/jest-dom/vitest";
import { TextEncoder, TextDecoder } from "util";

Object.assign(global, { TextEncoder, TextDecoder });
