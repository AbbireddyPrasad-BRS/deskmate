const { GoogleGenerativeAI } = require("@google/generative-ai");
const { tools } = require("../tools/definitions");
const db = require("../mocks/db");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are DeskMate, an AI-powered IT helpdesk assistant for Black Box Network Services.
Your primary user is currently employee EMP-001.

CRITICAL INSTRUCTIONS:
1. You must use the provided tools to fetch real data or take actions. Do not hallucinate data.
2. If a user requests software, ALWAYS check entitlements first. 
3. If they are not entitled to software, offer to create a ticket. 
4. If the user confirms they want a ticket created (e.g., "yes", "sure"), infer the software name and issue from the conversation history and immediately use the create_ticket tool. Do not check entitlements again.
5. If a request is outside IT scope (e.g., writing poems, sports, cooking), politely and gracefully refuse.
`;

async function processChat(userMessage, history = []) {
    const traces = []; 
    const logTrace = (msg) => traces.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

    logTrace("Received user intent.");
    
    const model = genAI.getGenerativeModel({
        model: "gemini-3.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: tools }]
    });

    // Map the frontend history format to Gemini's expected format
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    // Initialize the chat session with the prior context
    const chat = model.startChat({ history: formattedHistory });
    logTrace("Evaluating required tools vs natural language response...");

    try {
        let result = await chat.sendMessage(userMessage);
        let response = result.response;
        let calls = typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls;
        let functionCall = calls ? calls[0] : null;

        // Agent Loop: Handle conditional workflows and multiple tool executions
        while (functionCall) {
            const { name, args } = functionCall;
            logTrace(`Invoking tool: ${name} with args: ${JSON.stringify(args)}`);

            let toolResult = {};

            // Tool Execution Router
            try {
                if (name === "check_entitlement") {
                    const isEntitled = db.checkEntitlement(args.userId, args.software);
                    toolResult = { isEntitled };
                    logTrace(`Tool result: Entitlement is ${isEntitled}`);
                } else if (name === "create_ticket") {
                    const ticket = db.createTicket(args.userId, args.issue, args.priority);
                    toolResult = { ticket };
                    logTrace(`Tool result: Ticket created successfully (${ticket.id})`);
                }
                
                // Send the internal system result back to Gemini so it can reason on it
                result = await chat.sendMessage([{
                    functionResponse: { name, response: toolResult }
                }]);
                response = result.response;
                
                // Check if Gemini decides to call ANOTHER tool based on the result
                calls = typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls;
                functionCall = calls ? calls[0] : null;

            } catch (error) {
                logTrace(`[ERROR] Internal system execution failed: ${error.message}`);
                result = await chat.sendMessage([{ functionResponse: { name, response: { error: "System failure." } } }]);
                response = result.response;
                break; // Break the loop on failure to prevent infinite loops
            }
        }

        logTrace("Generated final natural language response.");
        return { reply: response.text(), traces };
    } catch (error) {
        return { reply: "I'm sorry, I encountered a critical error processing your request.", traces: [...traces, `[FATAL] ${error.message}`] };
    }
}

module.exports = { processChat };
