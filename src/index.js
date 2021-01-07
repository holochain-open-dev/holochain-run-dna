#!/usr/bin/env node
import { AdminWebsocket } from "@holochain/conductor-api";
import { sleep } from "./utils.js";
import { getAppToInstall } from "./args";
import { execHolochain } from "./execHolochain.js";
import { installApp, genPubKey } from "./installApp.js";
import getPort from "get-port";
import fs from "fs";
const yaml = require('js-yaml');
const chalk = require('chalk');

async function execAndInstall(appToInstall) {
  // If the admin port was set by the user, we shouldn't change it
  let adminPort = appToInstall.adminPort;
  if (!adminPort) {
    // Find a free port for the admin websocket,
    // but only if the admin port was not set by the user
    adminPort = await getPort({ port: appToInstall.adminPort });
  }

  let configCreated, realAdminPort
  if (!appToInstall.useAltConductorPort) {
    // Execute holochain
    ([configCreated, realAdminPort] = await execHolochain(
      adminPort,
      appToInstall.runPath,
      appToInstall.proxyUrl
      ));
    } else {
      realAdminPort = appToInstall.useAltConductorPort
      console.log(chalk.bold.blue(`Skipping internal Holochain Conductor setup and instead connecting to admin port of running Conductor at ${realAdminPort}.`))
  }

  // If the config file was created assume we also need to install everything
  if (configCreated || appToInstall.useAltConductorPort) {
      await sleep(100);
    
      let adminWebsocket;
      try {
        adminWebsocket = await AdminWebsocket.connect(
          `ws://localhost:${realAdminPort}`
        );        
      } catch (error) {
        throw new Error('Failed to connect to Admin Interface. Error: ', error);
      }

      let agentPubKey;
      if (!appToInstall.multipleAgents) {
        console.log(chalk.bold.blue('(-m FLAG OFF) Generating single agent pub key for all apps.'));
        try {
          agentPubKey = await genPubKey(adminWebsocket);
        } catch (error) {
          throw new Error('Unable to generate agent key. Error : ', error);
        }
      }

      if (appToInstall.happs) {
      const happs = yaml.safeLoad(fs.readFileSync(appToInstall.happs, 'utf8'));
      for(let happ of happs){
        await installApp(adminWebsocket, agentPubKey, happ.app_port,  happ.dnas, happ.app_name);
      }
    } else {
      await installApp(adminWebsocket, agentPubKey, appToInstall.appPort,  appToInstall.dnas, appToInstall.installedAppId);
    }
    await adminWebsocket.client.close();
  }
}

try {
  const appToInstall = getAppToInstall();
  execAndInstall(appToInstall).catch(console.error);
} catch (e) {
  console.error(e.message);
}
