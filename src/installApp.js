import { AppWebsocket, AdminWebsocket } from "@holochain/conductor-api";
import { ADMIN_PORT } from "./constants";

export async function installApp(port, dnas, appId) {
  console.log('\n Installing... \n ')

  const adminWebsocket = await AdminWebsocket.connect(
    `ws://localhost:${ADMIN_PORT}`
  );

  const pubKey = await adminWebsocket.generateAgentPubKey();

  const app = await adminWebsocket.installApp({
    agent_key: pubKey,
    app_id: appId,
    dnas: dnas.map((dna) => ({ nick: dna.nick, path: dna.path }))
  });
  
  console.log(' Installed App : ', app)

  await adminWebsocket.activateApp({ app_id: appId });
  await adminWebsocket.attachAppInterface({ port });

  const appWebsocket = await AppWebsocket.connect(`ws://localhost:${port}`);

  console.log(` Successfully installed app on port ${port}`);

  await appWebsocket.client.close();
  await adminWebsocket.client.close();
}
