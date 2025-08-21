module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/sen_dev/SenScript/website/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/53eeb_7ddd1fc5._.js",
  "build/chunks/[root-of-the-server]__1ceee6f6._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/sen_dev/SenScript/website/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];