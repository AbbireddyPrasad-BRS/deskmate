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
3. If they are not entitled to software, offer to create a ticket. If they explicitly asked for a ticket to be created upon failure, do it automatically.
4. If a request is outside IT scope (e.g., writing poems, sports, cooking), politely and gracefully refuse.
`;

async function processChat(userMessage) {
    const traces = []; 
    const logTrace = (msg) => traces.push(`[${new Date().toLocaleTimeString()}] ${msg}`);

    logTrace("Received user intent.");
    
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: tools }]
    });

    const chat = model.startChat();
    logTrace("Evaluating required tools vs natural language response...");

    try {
        let response = await chat.sendMessage(userMessage);
        let functionCall = response.functionCalls ? response.functionCalls()[0] : null;

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
                response = await chat.sendMessage([{
                    functionResponse: { name, response: toolResult }
                }]);
                
                // Check if Gemini decides to call ANOTHER tool based on the result
                functionCall = response.functionCalls ? response.functionCalls()[0] : null;

            } catch (error) {
                logTrace(`[ERROR] Internal system execution failed: ${error.message}`);
                response = await chat.sendMessage([{ functionResponse: { name, response: { error: "System failure." } } }]);
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
