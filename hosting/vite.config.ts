import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
// import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // visualizer({
    //   filename: "./dist/bundle-visualizer.html",
    //   open: true, // Automatically open the report in your default browser
    // }),
  ],
  build: {
    rollupOptions: {
      input: {
        leaderboard: resolve(__dirname, "src/widgets/Leaderboard.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) {
              return "vendor_firebase";
            }
          }
        },
      },
    },
  },
});
