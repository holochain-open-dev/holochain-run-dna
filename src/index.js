import { getAppToInstall, sleep } from "./utils";
import { execHolochain } from "./execHolochain";
import { installApp } from "./installApp";

async function execAndInstall(appToInstall) {
  // Execute holochain
  await execHolochain();

  await sleep(100);

  installApp(appToInstall.port, appToInstall.dnas, appToInstall.appId);
}

try {
  const appToInstall = getAppToInstall();
  execAndInstall(appToInstall).catch(console.error);
} catch (e) {
  console.error(e.message);
}
