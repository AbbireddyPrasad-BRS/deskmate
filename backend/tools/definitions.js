const tools = [
    {
        name: "check_entitlement",
        description: "Check if an employee is currently entitled to use a specific software application.",
        parameters: {
            type: "object",
            properties: {
                userId: { type: "string", description: "The employee ID (e.g., EMP-001)" },
                software: { type: "string", description: "The name of the software (e.g., Adobe Creative Suite)" }
            },
            required: ["userId", "software"]
        }
    },
    {
        name: "create_ticket",
        description: "Create an IT support ticket for an issue or software request.",
        parameters: {
            type: "object",
            properties: {
                userId: { type: "string", description: "The employee ID" },
                issue: { type: "string", description: "Description of the request or issue" },
                priority: { type: "string", description: "Ticket priority: low, medium, high" }
            },
            required: ["userId", "issue", "priority"]
        }
    }
];

module.exports = { tools };