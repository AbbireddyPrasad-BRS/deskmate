class MockDatabase {
    constructor() {
        // Realistic IT helpdesk state for our primary user
        this.users = [{ id: "EMP-001", name: "Alice", department: "Design" }];
        
        // Note: Adobe Creative Suite is INTENTIONALLY omitted to force the conditional ticket creation
        this.entitlements = [
            { userId: "EMP-001", software: "Slack", status: "active" },
            { userId: "EMP-001", software: "VPN", status: "active" }
        ];
        
        this.tickets = [
            { id: "INC-1042", userId: "EMP-001", issue: "VPN Drop", status: "In Progress", priority: "medium" }
        ];
    }

    checkEntitlement(userId, software) {
        const record = this.entitlements.find(e => 
            e.userId === userId && e.software.toLowerCase().includes(software.toLowerCase())
        );
        return record ? true : false;
    }

    createTicket(userId, issue, priority) {
        const newTicket = {
            id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
            userId,
            issue,
            priority,
            status: "Open"
        };
        this.tickets.push(newTicket);
        return newTicket;
    }
}

// Export as singleton for state persistence while the server runs
module.exports = new MockDatabase();