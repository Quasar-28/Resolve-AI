require("dotenv").config();

import { getSystemPrompt } from "./prompt";
import express from "express";


import cors from "cors";
import { nodeOrReact, GemChat } from "./geminiconfig";


const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/template", nodeOrReact);
app.post("/chat", GemChat);
console.log(process.env.port);
app.listen(process.env.PORT || 4000, () => {
  console.log("server connected");
});
