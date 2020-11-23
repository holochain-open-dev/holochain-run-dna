import { AppWebsocket, AdminWebsocket } from "@holochain/conductor-api";
import { ADMIN_PORT } from "./constants";

export async function installApp(port, dnas, installedAppId) {
  const adminWebsocket = await AdminWebsocket.connect(
    `ws://localhost:${ADMIN_PORT}`
  );

  const pubKey = await adminWebsocket.generateAgentPubKey();

  const app = await adminWebsocket.installApp({
    agent_key: pubKey,
    installed_app_id: installedAppId,
    dnas: dnas.map((dna) => {
      const path = dna.split("/");
      return { nick: path[path.length - 1], path: dna };
    }),
  });

  await adminWebsocket.activateApp({ installed_app_id: installedAppId });
  await adminWebsocket.attachAppInterface({ port });

  const appWebsocket = await AppWebsocket.connect(`ws://localhost:${port}`);

  console.log(`Successfully installed app on port ${port}`);

  await appWebsocket.client.close();
  await adminWebsocket.client.close();
}
