import "dotenv/config";
import { syncSmmServices } from "../src/lib/smm/sync";

async function main() {
  const result = await syncSmmServices();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
