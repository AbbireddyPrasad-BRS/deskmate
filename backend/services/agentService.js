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
6. Keep all your responses sharp, concise, and professional. Avoid unnecessary conversational filler.
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

        // Agent Loop: Handle conditional workflows and multiple tool executions
        while (calls && calls.length > 0) {
            const functionResponses = [];

            for (const call of calls) {
                const { name, args } = call;
                logTrace(`Invoking tool: ${name} with args: ${JSON.stringify(args)}`);

                let toolResult = {};

                // Tool Execution Router
                try {
                    if (name === "check_entitlement") {
                        const isEntitled = db.checkEntitlement(args.userId, args.software);
                        toolResult = { isEntitled };
                        logTrace(`Tool result: Entitlement is ${isEntitled}`);
                    } else if (name === "create_ticket") {
                        const ticket = db.createTicket(args.userId, args.issue, args.priority || 'medium');
                        toolResult = { ticket };
                        logTrace(`Tool result: Ticket created successfully (${ticket.id})`);
                    } else if (name === "get_ticket_status") {
                        const status = db.getTicketStatus(args.ticketId);
                        toolResult = { status };
                        logTrace(`Tool result: Ticket status lookup for ${args.ticketId} returned ${status.found}`);
                    } else if (name === "reset_password") {
                        const reset = db.resetPassword(args.userId);
                        toolResult = { reset };
                        logTrace(`Tool result: Password reset triggered for ${args.userId}`);
                    }
                } catch (error) {
                    logTrace(`[ERROR] Internal system execution failed: ${error.message}`);
                    toolResult = { error: "System failure." };
                }
                
                functionResponses.push({
                    functionResponse: { name, response: toolResult }
                });
            }

            try {
                // Send ALL internal system results back to Gemini so it can reason on them
                result = await chat.sendMessage(functionResponses);
                response = result.response;
                
                // Check if Gemini decides to call ANOTHER tool based on the result
                calls = typeof response.functionCalls === 'function' ? response.functionCalls() : response.functionCalls;
            } catch (error) {
                logTrace(`[ERROR] Communication with Gemini failed: ${error.message}`);
                break; // Break the loop on failure to prevent infinite loops
            }
        }

        logTrace("Generated final natural language response.");
        
        let finalReply = "";
        try {
            finalReply = response.text();
            if (!finalReply) finalReply = "I have processed your request. Let me know if you need anything else!";
        } catch (error) {
            finalReply = "I have completed the tasks. Is there anything else you need?";
        }
        
        return { reply: finalReply, traces };
    } catch (error) {
        return { reply: "I'm sorry, I encountered a critical error processing your request.", traces: [...traces, `[FATAL] ${error.message}`] };
    }
}

module.exports = { processChat };
