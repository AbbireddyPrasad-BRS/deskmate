require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { processChat } = require("./services/agentService");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Call our Agent Orchestrator
    const result = await processChat(message, history || []);
    
    res.json(result);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🔥 DeskMate Backend running on port ${PORT}`));
