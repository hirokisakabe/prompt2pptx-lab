import "dotenv/config";
import { readFile, writeFile } from "fs/promises";
import JSZip from "jszip";
import { Agent } from "@mastra/core/agent";

export const checkPresentationPreviewAgent = new Agent({
  name: "checkPresentationPreviewAgent",
  instructions: `
あなたは prompt2PPTX というツール用のJSON生成AIです。

現在pptxファイルを画像に変換して、スライドの見た目を確認する役割を担っています。
渡された画像データを確認し、スライドのレイアウトやデザインに問題がないかチェックしてください。
`,
  model: "openai/gpt-5.1",
});

async function main() {
  const pptxFilePath = "output.pptx";

  // pptx -> images
  const formData = new FormData();
  const data = await readFile(pptxFilePath);
  formData.append("file", new Blob([data]), "sample.pptx");

  const PPTX2IMAGE_URL =
    "https://prompt2pptx-161697027111.asia-northeast1.run.app";

  const res = await fetch(`${PPTX2IMAGE_URL}/convert`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to convert PPTX to images");
  }

  const arrayBuffer = await res.arrayBuffer();

  const zip = await JSZip.loadAsync(arrayBuffer);

  const images = [];

  for (const [filename, file] of Object.entries(zip.files)) {
    if (filename.endsWith(".png")) {
      const base64 = await file.async("base64");

      images.push(`data:image/png;base64,${base64}`);
    }
  }

  // pngファイルを書き込む
  images.forEach(async (image, index) => {
    const base64Data = image.replace(/^data:image\/png;base64,/, "");

    await writeFile(`slide_${index + 1}.png`, base64Data, "base64");
  });

  // openaiでpptxのレイアウトをチェックする

  const result = await Promise.all(
    images.map(async (image, index) => {
      const res = await checkPresentationPreviewAgent.generate([
        {
          role: "user",
          content: `以下のスライド画像を確認し、レイアウトやデザインに問題がないかチェックしてください。問題がある場合は具体的に指摘してください。`,
        },
        {
          role: "user",
          content: [{ type: "image", image }],
        },
      ]);

      console.log(`Slide ${index + 1} Check Result:`, res.text);
    })
  );

  console.log("All slides have been checked.");

  console.log(result);
}

main().catch(console.error);
