import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    define: {
      __API_URL__: JSON.stringify(
        env.REACT_APP_API_URL || "http://localhost/api"
      ),
    },

    server: {
      open: true,
    },
  };
});