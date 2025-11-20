import { mastra } from "./src/mastra";
import { pomNodeSchema, buildPptx } from "@hirokisakabe/pom";
import { z } from "zod";
import "dotenv/config";

async function main() {
  const agent = mastra.getAgent("prompt2pptxAgent");

  const res = await agent.generate(
    "地学の基本について説明する5枚のスライドを作成してください。",
    {
      structuredOutput: {
        schema: z.array(pomNodeSchema),
      },
    }
  );

  const pom = res.object;

  const pptx = await buildPptx(pom, { w: 1280, h: 720 });

  await pptx.writeFile({ fileName: "output.pptx" });
}

main().catch(console.error);
