import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        // Add other globals if needed, e.g., for browsers:
        // ...globals.browser
      }
    },
  }
]);
