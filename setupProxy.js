const express = require("express");
let cors = require("cors");

const { createProxyMiddleware } = require("http-proxy-middleware");

let sessionCookie = "";
const onProxyReq = (proxyReq) => {
    if (sessionCookie) {
        proxyReq.setHeader("cookie", sessionCookie);
    }
};
const onProxyRes = (proxyRes) => {
    const proxyCookie = proxyRes.headers["set-cookie"];
    if (proxyCookie) {
        sessionCookie = proxyCookie;
    }
};
// proxy middleware options

const options = {
    // target: "https://play.im.dhis2.org/stable-2-39-9",
    // target: "http://localhost:8080",
    target: "https://chis.tasouganda.org/prod",
    // target: "https://hmis-tests.health.go.ug",
    // target: "https://play.im.dhis2.org/dev",
    // target: "https://academy.demos.dhis2.org/test1",
    // target: "https://emisuganda.org/emis",
    // target: "https://hmis-adex.health.go.ug/dhis",
    // target: "https://hmis.health.go.ug",
    // target: "https://anc.health.go.ug/dhis",
    // target: "https://eidsr.health.go.ug",
    // target: "https://hfqap.health.go.ug",
    // target: "https://emiseswatini.dev.hispuganda.org/emiseswatini",
    // target: "https://sd.emis.ac.sz/emis",
    // target: "https://ucndw.afro.who.int/dev",
    // target: "https://play.im.dhis2.org/stable-2-41-0-1",
    // target: "https://customization.health.go.ug/hmis",
    // target: "https://ikis.ugandakpc.org/dhis",
    // target: "https://tbl-ecbss.health.go.ug",
    // target: "http://ovcnwa.youthaliveuganda.org",
    // target: "https://anc.health.go.ug/dhis",
    onProxyReq,
    onProxyRes,
    changeOrigin: true,
    auth: undefined,
    logLevel: "debug",
};

// create the proxy (without context)
const exampleProxy = createProxyMiddleware(options);

const app = express();
app.use(
    cors({
        credentials: true,
        origin: ["http://localhost:3000"],
    }),
);
app.use("/", exampleProxy);
app.listen(3002);
