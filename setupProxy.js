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
    //target: "https://ugandaeidsr.org",
    target: "https://play.im.dhis2.org/dev",
    // target: "https://academy.demos.dhis2.org/test1",
    // target: "https://hmis-tests.health.go.ug",
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
    })
);
app.use("/", exampleProxy);
app.listen(3002);
