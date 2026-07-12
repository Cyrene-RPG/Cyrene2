import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";

const updateChannel = process.env.CYRENE_UPDATE_CHANNEL ?? "latest";

export default defineConfig({
  base: "./",
  define: {
    __CYRENE_UPDATE_CHANNEL__: JSON.stringify(updateChannel),
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          define: {
            __UPDATE_CHANNEL__: JSON.stringify(updateChannel),
          },
          build: {
            rollupOptions: {
              external: ["electron-updater", "electron-log"],
            },
          },
        },
      },
      preload: {
        input: "electron/preload.ts",
        vite: {
          define: {
            __UPDATE_CHANNEL__: JSON.stringify(updateChannel),
          },
        },
      },
    }),
  ],
});
