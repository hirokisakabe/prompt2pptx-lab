import { mastra } from "./src/mastra";
import { pomNodeSchema, buildPptx } from "@hirokisakabe/pom";
import { z } from "zod";
import "dotenv/config";

async function main() {
  const agent = mastra.getAgent("prompt2pptxAgent");

  const res = await agent.generate(
    "地学の基本について説明する5枚のスライドを作成してください。"
  );

  const text = res.text;

  const jsonMatch =
    text.match(/```json\n([\s\S]*?)\n```/) ||
    text.match(/```\n([\s\S]*?)\n```/);
  let jsonStr = jsonMatch ? jsonMatch[1] : text;

  if (
    !jsonMatch &&
    (text.trim().startsWith("[") || text.trim().startsWith("{"))
  ) {
    jsonStr = text.trim();
  }

  const parsedJson = JSON.parse(jsonStr);
  const pom = z.array(pomNodeSchema).parse(parsedJson.slides || parsedJson);

  console.log("Generated POM:", JSON.stringify(pom, null, 2));

  const pptx = await buildPptx(pom, { w: 1280, h: 720 });

  await pptx.writeFile({ fileName: "output.pptx" });
}

main().catch(console.error);
