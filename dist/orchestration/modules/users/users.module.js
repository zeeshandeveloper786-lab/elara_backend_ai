"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_model_1 = require("../../AI-model/openai-model");
const user_insights_supervisor_1 = require("./supervisor/user-insights.supervisor");
const user_insight_agent_1 = require("./agent/user-insight.agent");
const get_user_profile_service_1 = require("./tools/get-user-profile/get-user-profile.service");
const update_user_profile_service_1 = require("./tools/update-user-profile/update-user-profile.service");
const change_user_password_service_1 = require("./tools/change-user-password/change-user-password.service");
const delete_user_service_1 = require("./tools/delete-user/delete-user.service");
const users_tools_service_1 = require("./tools/users-tools.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: openai_1.ChatOpenAI,
                useFactory: () => (0, openai_model_1.createModel)(),
            },
            user_insights_supervisor_1.UserInsightsSupervisorService,
            user_insight_agent_1.UserInsightAgentService,
            get_user_profile_service_1.GetUserProfileService,
            update_user_profile_service_1.UpdateUserProfileService,
            change_user_password_service_1.ChangeUserPasswordService,
            delete_user_service_1.DeleteUserService,
            users_tools_service_1.UsersToolsService,
        ],
        exports: [
            user_insights_supervisor_1.UserInsightsSupervisorService,
            user_insight_agent_1.UserInsightAgentService,
            get_user_profile_service_1.GetUserProfileService,
            update_user_profile_service_1.UpdateUserProfileService,
            change_user_password_service_1.ChangeUserPasswordService,
            delete_user_service_1.DeleteUserService,
            users_tools_service_1.UsersToolsService,
        ],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map