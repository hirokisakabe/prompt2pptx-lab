import { mastra } from "./src/mastra";
import "dotenv/config";

async function main() {
  const agent = mastra.getAgent("weatherAgent");

  const res = await agent.generate("こんにちは");

  console.log(res.text);
}

main().catch(console.error);
