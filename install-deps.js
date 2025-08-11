// 📄 install-deps.js
const { spawn } = require("child_process");
const path = require("path");

function installDependencies(name, cwd) {
  const process = spawn("npm", ["install"], {
    cwd: path.resolve(__dirname, cwd),
    stdio: "inherit",
    shell: true, // ensures compatibility on Windows
  });

  process.on("close", (code) => {
    console.log(`${name} install exited with code ${code}`);
  });
}

installDependencies("Client", "client");
installDependencies("Server", "server");
