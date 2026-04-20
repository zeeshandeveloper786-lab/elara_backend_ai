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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationController = void 0;
const common_1 = require("@nestjs/common");
const orchestration_service_1 = require("./orchestration.service");
const graph_input_dto_1 = require("./dto/graph-input.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
let OrchestrationController = class OrchestrationController {
    orchestrationService;
    constructor(orchestrationService) {
        this.orchestrationService = orchestrationService;
    }
    async runGraph(input, req) {
        try {
            const user = req.user;
            const orchestrationInput = {
                ...input,
                user_id: user.sub,
                email: user.email,
                user_name: user.user_name,
                authorization: req.headers.authorization,
            };
            const result = await this.orchestrationService.runOrchestration(orchestrationInput);
            const last = result.messages.at(-1);
            const finalMessages = last
                ? [
                    {
                        role: last._getType(),
                        content: last.content,
                    },
                ]
                : [];
            return {
                success: true,
                data: {
                    messages: finalMessages,
                    usage_stats: result.usage_stats,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
};
exports.OrchestrationController = OrchestrationController;
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.Post)('run'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [graph_input_dto_1.GraphInputDto, Object]),
    __metadata("design:returntype", Promise)
], OrchestrationController.prototype, "runGraph", null);
exports.OrchestrationController = OrchestrationController = __decorate([
    (0, common_1.Controller)('orchestration'),
    __metadata("design:paramtypes", [orchestration_service_1.OrchestrationService])
], OrchestrationController);
//# sourceMappingURL=orchestration.controller.js.map