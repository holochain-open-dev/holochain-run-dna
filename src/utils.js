import fs from "fs";

function getDnaPath(provisionalPath) {
  if (fs.existsSync(provisionalPath)) {
    return provisionalPath;
  } else if (fs.existsSync(__dirname + provisionalPath)) {
    return __dirname + provisionalPath;
  } else {
    throw new Error(`Couldn't file dna with path ${provisionalPath}`);
  }
}

export function getAppToInstall() {
  const appId = process.argv[2];
  console.log('APP_ID : ', appId);

  let appInterfacePort = 8888;
  let dnaArgs, port

  if (process.argv[3].includes(".gz")) {
    dnaArgs = process.argv.slice(3);
  } else {
    appInterfacePort = process.argv[3];
    dnaArgs = process.argv.slice(4);
  }

  try {
    port = parseInt(appInterfacePort)
  } catch (error) {
    throw new Error(`
    Bad input!
    USAGE: Port value must be a number
  `);
  }

  console.log('APP_INTERFACE_PORT: ', appInterfacePort);
  console.log('DNAs to install for App: ', dnaArgs);

  if (!appId || dnaArgs.length === 0)
    throw new Error(`
  Bad input!
  USAGE: npx @holochain-open-dev/holochain-run-dna <APP_ID> (PORT) [DNA_PATH, DNA_PATH...]
`);

  const dnas = dnaArgs.map((arg) => {
    const dnaPath = getDnaPath(arg);
    const path = dnaPath.split(".gz");
    return {
      path: dnaPath,
      nick: path[0]
    }
  });

  return {
    appId,
    port,
    dnas
  }
}

export const sleep = (ms) =>
  new Promise((resolve) => setTimeout(() => resolve(), ms));
