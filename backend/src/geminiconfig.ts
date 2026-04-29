import Groq from "groq-sdk";
import { basePrompt as nodebasePrompt } from "./defaults/node";
import { basePrompt as reactbasePrompt } from "./defaults/react";
import { BASE_PROMPT, getSystemPrompt } from "./prompt";
import { Request, Response } from "express";
import dotenv from "dotenv"

dotenv.config()

const ai = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function nodeOrReact(req: Request, res: Response): Promise<void> {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      res.status(400).json({ message: "Prompt is required" });
      return;
    }
    console.log("templates");
    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile", // or "llama3-70b-8192" or another Groq-supported model
      messages: [
        {
          role: "user",
          content: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra.\n${prompt}`,
        },
      ],
      max_tokens: 1024,
    });
    const answer = (response.choices?.[0]?.message?.content ?? "").trim().toLowerCase();
    if (answer.includes("react")) {
      res.status(200).json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactbasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactbasePrompt],
      });
      return;
    }
    if (answer.includes("node")) {
      res.status(200).json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodebasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodebasePrompt],
      });
      return;
    }
    res.status(403).json({
      message: "Invalid response: Expected 'node' or 'react'",
      answer: answer,
    });
  } catch (error) {
    console.error("Error in nodeOrReact:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function GemChat(req: Request, res: Response): Promise<void> {
  try {
    const messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ message: "Messages array is required" });
      return;
    }
    console.log("hello");
    // Concatenate all messages for Gemini prompt
    const chatPrompt = messages.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n");
    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getSystemPrompt() },
        ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
      ],
      max_tokens: 3072,
    });
    res.status(200).json({ response: response.choices?.[0]?.message?.content });
  } catch (error) {
    console.error("Error in GemChat:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
