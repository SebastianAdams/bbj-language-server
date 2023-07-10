const vscode = require("vscode");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");
const PropertiesReader = require("properties-reader");

const getBBjHome = () => {
  const home = vscode.workspace.getConfiguration("bbj").home;

  if (!home) {
    window.showErrorMessage(
      "bbj.home settings cannot be found - you must add this to the configuration"
    );
    return "";
  }

  return home;
}

const runWeb = (params, client) => {
  const home = getBBjHome();
  if (!home) return;

  const webConfig = vscode.workspace.getConfiguration("bbj.web");
  const bbj = `${home}/bin/bbj${os.platform() === "win32" ? ".exe" : ""}`;
  const webRunnerWorkingDir = path.resolve(`${__dirname}/../tools`);
  const username = vscode.workspace.getConfiguration("bbj").web.username;
  const password = vscode.workspace.getConfiguration("bbj").web.password;
  const active = vscode.window.activeTextEditor;
  const fileName = active ? active.document.fileName : params.fsPath;
  const workingDir = path.dirname(fileName);
  const programme = path.basename(fileName);
  const name = webConfig.apps.hasOwnProperty(programme)
    ? webConfig.apps[programme].name
    : programme
      .split(".")
      .slice(0, -1)
      .join(".");

  const cmd = `${bbj} -q -WD${webRunnerWorkingDir} ${webRunnerWorkingDir}/web.bbj - "${client}" "${name}" "${programme}" "${workingDir}" "${username}" "${password}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      window.showErrorMessage(`Failed to run "${programme}"`);
      return;
    }
  });
};

const Commands = {
  openConfigFile: function () {
    const home = getBBjHome();

    if (home) {
      return vscode.workspace
        .openTextDocument(`${home}/cfg/config.bbx`)
        .then(doc => {
          vscode.window.showTextDocument(doc);
        });
    }
  },

  openPropertiesFile: function () {
    const home = getBBjHome();

    if (home) {
      return vscode.workspace
        .openTextDocument(`${home}/cfg/BBj.properties`)
        .then(doc => {
          vscode.window.showTextDocument(doc);
        });
    }
  },

  openEnterpriseManager() {
    const home = getBBjHome();
    if (home) {
      const properties = PropertiesReader(`${home}/cfg/BBj.properties`);
      const url = `${"http://" + properties.get('com.basis.jetty.host') + ":" + properties.get('com.basis.jetty.port') + "/bbjem/em"}`;
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  },

  run: function (params) {
    const home = getBBjHome();
    if (home) {
      const bbj = `${home}/bin/bbj${os.platform() === "win32" ? ".exe" : ""}`;
      const active = vscode.window.activeTextEditor;
      const fileName = active ? active.document.fileName : params.fsPath;
      const workingDir = path.dirname(fileName);
      const cmd = `${bbj} -q -WD${workingDir} ${fileName}`;

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          window.showErrorMessage(`Failed to run "${fileName}"`);
          return;
        }
      });
    }
  },

  runBUI: function (params) {
    runWeb(params, "BUI");
  },

  runDWC: function (params) {
    runWeb(params, "DWC");
  }
};

module.exports = Commands;
