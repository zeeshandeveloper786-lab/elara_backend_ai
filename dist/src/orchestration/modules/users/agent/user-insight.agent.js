"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInsightAgent = exports.UserInsightAgentService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const users_tools_1 = require("../tools/users.tools");
let UserInsightAgentService = class UserInsightAgentService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async execute(state) {
        const userContext = state.user_name || 'User';
        const currentTask = state.current_task || 'Manage user account';
        const systemPrompt = `You are a user profile and account specialist with access to account tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. get_user_profile - Retrieve user profile and statistics
2. update_user_profile - Update name and email
3. change_user_password - Change account password
4. delete_user - Delete user account

WORKFLOW GUIDELINES:
1. For profile retrieval: Use get_user_profile
2. For updates: Use update_user_profile with new information
3. For password changes: Use change_user_password with verification
4. For account deletion: Use delete_user with confirmation
5. Always confirm operations before executing

SECURITY GUIDELINES:
- Verify user identity for sensitive operations
- Ensure password changes are secure
- Protect personal information
- Confirm destructive operations

IMPORTANT:
- Do not assume parameters - ask if missing
- Verify information before updating
- Explain what action will be taken

Respond clearly and helpfully to the user's request.`;
        const agent = this.chatModel.bindTools(users_tools_1.userTools);
        const response = await agent.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            messages: [response],
            sender: 'UserInsightAgent',
        };
    }
};
exports.UserInsightAgentService = UserInsightAgentService;
exports.UserInsightAgentService = UserInsightAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], UserInsightAgentService);
const userInsightAgent = async (state, model) => {
    const service = new UserInsightAgentService(model);
    return service.execute(state);
};
exports.userInsightAgent = userInsightAgent;
//# sourceMappingURL=user-insight.agent.js.map