import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins:
    mode === "test"
      ? [tailwindcss(), tsconfigPaths()]
      : [tailwindcss(), reactRouter(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    globals: true,
  },
}));
