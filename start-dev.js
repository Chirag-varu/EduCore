// 📄 start-dev.js
const { spawn } = require("child_process");
const path = require("path");

function runDevScript(name, cwd) {
  const process = spawn("npm", ["run", "dev"], {
    cwd: path.resolve(__dirname, cwd),
    stdio: "inherit",
    shell: true, // important for Windows compatibility
  });

  process.on("close", (code) => {
    console.log(`${name} exited with code ${code}`);
  });
}

// Run both scripts
runDevScript("Client", "client");
runDevScript("Server", "server");