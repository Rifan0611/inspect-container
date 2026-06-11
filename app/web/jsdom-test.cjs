const jsdom = require("jsdom");
const { JSDOM } = jsdom;

JSDOM.fromURL("https://inspect-container.vercel.app/", {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
}).then(dom => {
  dom.window.addEventListener("error", event => {
    console.error("JSDOM Error:", event.error);
  });
  dom.window.addEventListener("unhandledrejection", event => {
    console.error("JSDOM Unhandled Rejection:", event.reason);
  });
  
  // Wait a bit for React to render
  setTimeout(() => {
    console.log("HTML length:", dom.window.document.body.innerHTML.length);
    console.log("Body HTML:", dom.window.document.body.innerHTML);
    process.exit(0);
  }, 5000);
}).catch(e => {
  console.error("Failed to load JSDOM:", e);
});
