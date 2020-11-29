#!/usr/bin/env node
import { sleep } from "./utils.js";
import { getAppToInstall } from "./args";
import { execHolochain } from "./execHolochain.js";
import { installApp, attachAppInterface } from "./installApp.js";
import getPort from "get-port";

async function execAndInstall(appToInstall) {

  // Find a free port for the admin websocket
  const adminPort = await getPort({ port: 1234 });

  // Execute holochain
  const configCreated = await execHolochain(adminPort, appToInstall.runPath,  appToInstall.proxyUrl);

  // If the config file was created assume we also need to install everything
  if (configCreated) {
    await sleep(100);
    installApp(adminPort, appToInstall.appPort,  appToInstall.dnas, appToInstall.installedAppId);
  } else {
    await sleep(500);
    attachAppInterface(adminPort, appToInstall.appPort, appToInstall.installedAppId);
  }
}

try {
  const appToInstall = getAppToInstall();
  execAndInstall(appToInstall).catch(console.error);
} catch (e) {
  console.error(e.message);
}
