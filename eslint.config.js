import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: [["*/src/*", "**/.js"]],
        ignores: ["**/*.config.js"],
		rules: {
			semi: "error",
		},
	},
]);
