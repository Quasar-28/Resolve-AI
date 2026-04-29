"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeOrReact = nodeOrReact;
exports.GemChat = GemChat;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const prompt_1 = require("./prompt");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
function nodeOrReact(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const prompt = req.body.prompt;
            if (!prompt) {
                res.status(400).json({ message: "Prompt is required" });
                return;
            }
            console.log("templates");
            const response = yield ai.chat.completions.create({
                model: "llama-3.3-70b-versatile", // or "llama3-70b-8192" or another Groq-supported model
                messages: [
                    {
                        role: "user",
                        content: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra.\n${prompt}`,
                    },
                ],
                max_tokens: 1024,
            });
            const answer = ((_d = (_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : "").trim().toLowerCase();
            if (answer.includes("react")) {
                res.status(200).json({
                    prompts: [
                        prompt_1.BASE_PROMPT,
                        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                    ],
                    uiPrompts: [react_1.basePrompt],
                });
                return;
            }
            if (answer.includes("node")) {
                res.status(200).json({
                    prompts: [
                        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                    ],
                    uiPrompts: [node_1.basePrompt],
                });
                return;
            }
            res.status(403).json({
                message: "Invalid response: Expected 'node' or 'react'",
                answer: answer,
            });
        }
        catch (error) {
            console.error("Error in nodeOrReact:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
function GemChat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const messages = req.body.messages;
            if (!messages || !Array.isArray(messages)) {
                res.status(400).json({ message: "Messages array is required" });
                return;
            }
            console.log("hello");
            // Concatenate all messages for Gemini prompt
            const chatPrompt = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
            const response = yield ai.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: (0, prompt_1.getSystemPrompt)() },
                    ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
                ],
                max_tokens: 3072,
            });
            res.status(200).json({ response: (_c = (_b = (_a = response.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content });
        }
        catch (error) {
            console.error("Error in GemChat:", error);
            res.status(500).json({
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
}
