import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function extractBuiltAsset(html, pattern, fallback) {
  return html.match(pattern)?.[1] || fallback;
}

function copyStaticRootFiles() {
  return {
    name: "copy-static-root-files",
    closeBundle() {
      const helpPdf = resolve("manual-orcamento.pdf");

      if (existsSync(helpPdf)) {
        copyFileSync(helpPdf, resolve("dist", "manual-orcamento.pdf"));
      }

      const jspSource = resolve("index.jsp");
      const htmlOutput = resolve("dist", "index.html");

      if (existsSync(jspSource) && existsSync(htmlOutput)) {
        const html = readFileSync(htmlOutput, "utf8");
        const jsAsset = extractBuiltAsset(html, /src="\.\/(assets\/[^"]+\.js)"/, "assets/index-BPewjmlw.js");
        const cssAsset = extractBuiltAsset(html, /href="\.\/(assets\/[^"]+\.css)"/, "assets/index-BlgbisUs.css");
        const jsp = readFileSync(jspSource, "utf8")
          .replace(/\$\{BASE_FOLDER\}\/assets\/index-[^"]+\.js/g, "${BASE_FOLDER}/" + jsAsset)
          .replace(/\$\{BASE_FOLDER\}\/assets\/index-[^"]+\.css/g, "${BASE_FOLDER}/" + cssAsset);

        writeFileSync(resolve("dist", "index.jsp"), jsp, "utf8");
      }
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), copyStaticRootFiles()],
  build: {
    outDir: "dist",
    assetsDir: "assets"
  }
});
