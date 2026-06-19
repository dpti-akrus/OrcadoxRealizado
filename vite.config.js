import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function copyHelpPdf() {
  return {
    name: "copy-help-pdf",
    closeBundle() {
      const source = resolve("manual-orcamento.pdf");

      if (existsSync(source)) {
        copyFileSync(source, resolve("dist", "manual-orcamento.pdf"));
      }
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), copyHelpPdf()],
  build: {
    outDir: "dist",
    assetsDir: "assets"
  }
});
