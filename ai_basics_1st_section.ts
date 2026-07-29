import { generateText, embed, Output, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import z from "zod";

const ollama = createOpenAI({
  baseURL: "http://127.0.0.1:11434/v1",
  apiKey: "ollama-local", // Для локальної Ollama ключ не перевіряється
});

// async function main() {
//   console.log("⏳ Генерую відповідь...");

//   const ollamaModel = ollama("llama3.1");

//   const { text } = await generateText({
//     model: ollamaModel,
//     prompt: "Поясни концепцію квантової заплутаності одним коротким абзацом.",
//   });

//   console.log("\n✅ Відповідь LLM:");
//   console.log(text);
// }

// async function main() {
//   const textToEmbed =
//     "Векторні бази даних дозволяють робити семантичний пошук.";

//   console.log("⏳ Генерую ембеддінг (вектор)...");

//   const { embedding, usage } = await embed({
//     model: ollama.embeddingModel("nomic-embed-text"),
//     value: textToEmbed,
//   });

//   console.log("\n✅ Ембеддінг успішно згенеровано!");
//   console.log(`Розмірність вектора (кількість вимірів): ${embedding.length}`); // Має бути 768
//   console.log("Перші 5 чисел з масиву:");
//   console.log(embedding.slice(0, 5));

//   console.log("\nВикористано токенів:", usage);
// }

// async function main() {
//   const requestText = "Відправ мені рецепт піцци";

//   const ollamaModel = ollama("llama3.1");

//   const { output } = await generateText({
//     model: ollamaModel,
//     output: Output.object({
//       schema: z.object({
//         recipe: z.object({
//           name: z.string(),
//           ingredients: z.array(
//             z.object({ name: z.string(), amount: z.string() }),
//           ),
//           steps: z.array(z.string()),
//         }),
//       }),
//     }),
//     prompt: requestText,
//     temperature: 0.1,
//     system:
//       "Ти професійний італійський шеф-кухар. Твоя мета — надавати точні, логічні та покрокові кулінарні рецепти українською мовою. Жодних вигадок і метафор.",
//   });

//   console.log("😀Pizza:", output);
// }

async function main() {
  const MAX_STEPS = 3;
  const prompt =
    'Привіт! У нас на проді відвалюються платежі. Перевір статус бази "payment-db-prod". Якщо вона в статусі "offline", перезапусти її.';

  const checkServerStatus = tool({
    description: "Check server status",
    inputSchema: z.object({
      serverName: z.string().describe("The name of the server"),
    }),
    execute: ({ serverName }) => {
      console.log(`1 - Check server ${serverName}`);
      return { status: "offline", latency: "timeout" };
    },
  });

  const restartServer = tool({
    description: "Restart server",
    inputSchema: z.object({
      serverName: z.string().describe("The name of the server"),
      status: z.string().describe("Server status for restart"),
    }),
    execute: ({ serverName, status }) => {
      console.log(`2 - Restart server ${serverName},  status: ${status}`);
      return { success: true, message: "Server restart initiated" };
    },
  });

  const result = await generateText({
    model: ollama("llama3.1"),
    tools: { checkServerStatus, restartServer },
    prompt,
    stopWhen: stepCountIs(MAX_STEPS),
    instructions:
      "Ти DevOps асистент. Використовуй інструменти для управління серверами.",
  });

  console.log("\n💬 ФІНАЛЬНА ВІДПОВІДЬ ->", result.text);
}

main().catch(console.error);
