import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";

dotenv.config({ path: "./.env" });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userQuery = req.body.query;

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "text-embedding-004",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "ayush-collection",
      }
    );

    const retriever = vectorStore.asRetriever({ k: 3 });
    const relevantChunks = await retriever.invoke(userQuery);

    const SYSTEM_PROMPT = `
      You are an AI assistant who helps resolving user queries based on content 
      available to you from the pdf file with content and exact PAGE NUMBER.
      Only answer from the available context.

      Context: ${JSON.stringify(relevantChunks)}
    `;

    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
