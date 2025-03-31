import fs from "node:fs/promises";
import path from "node:path";

interface Message {
  chat_id: string;
  candidate_id: string;
  raw_content: string;
  create_time: string;
  tti_image_rel_path: Record<string, never>; // No messages have this but it exists as a property
}

type MessageData = Message[];

export async function extractData(messageData: MessageData): Promise<void> {
  const chatIdSet: Set<string> = new Set();
  const candidateIdSet: Set<string> = new Set();

  const messages: string[] = [];

  for (const message of messageData) {
    chatIdSet.add(message.chat_id);
    candidateIdSet.add(message.candidate_id);
    messages.push(message.raw_content);
  }

  const chatIds: string[] = [];
  const candidateIds: string[] = [];

  chatIdSet.forEach((chatId: string): void => {
    chatIds.push(chatId);
  });

  candidateIdSet.forEach((candidateId: string): void => {
    candidateIds.push(candidateId);
  });

  await fs.writeFile(
    path.join(__dirname, "../gen-data/chat_id.json"),
    JSON.stringify(chatIds),
    "utf8"
  );

  await fs.writeFile(
    path.join(__dirname, "../gen-data/candidate_id.json"),
    JSON.stringify(candidateIds),
    "utf8"
  );

  await fs.writeFile(
    path.join(__dirname, "../gen-data/messages.json"),
    JSON.stringify(messages),
    "utf8"
  );
}

async function main(): Promise<void> {
  const messageDataString: string = await fs.readFile(
    path.join(__dirname, "../data/message.json"),
    {
      encoding: "utf8",
    }
  );

  const messageData: MessageData = JSON.parse(messageDataString);

  // extractData(messageData);

  console.log(messageData[Math.floor(Math.random() * messageData.length - 1)]);
}

main();
