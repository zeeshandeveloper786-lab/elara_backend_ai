"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScryTool = createScryTool;
const tools_1 = require("@langchain/core/tools");
function createScryTool(handler, config) {
    const requireUser = config.requireUser !== false;
    return (0, tools_1.tool)(async (args, runnableConfig) => {
        const state = runnableConfig.configurable?.state || {};
        if (requireUser && !state.user_id) {
            console.error(`❌ [TOOL ERROR] ${config.name}: Missing user_id in state`);
            console.error('Available state keys:', Object.keys(state));
            return '❌ **Authentication Error:** Your session is missing user identification. Please log in again to use this tool.';
        }
        return handler(args, state);
    }, {
        name: config.name,
        description: config.description,
        schema: config.schema,
    });
}
//# sourceMappingURL=tool-wrapper.js.map