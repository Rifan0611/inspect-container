import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./src/App.jsx";

try {
  const html = ReactDOMServer.renderToString(React.createElement(App));
  console.log("Render successful!");
} catch (e) {
  console.error("RENDER ERROR:", e);
}
