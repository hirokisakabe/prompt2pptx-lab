import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { prompt2pptxAgent } from "./agents/prompt2pptx-agent";

export const mastra = new Mastra({
  agents: { prompt2pptxAgent },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
