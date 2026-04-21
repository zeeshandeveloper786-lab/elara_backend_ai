"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const orchestration_service_1 = require("./orchestration/orchestration.service");
const orchestration_controller_1 = require("./orchestration/orchestration.controller");
const scripy_supervisor_module_1 = require("./orchestration/modules/main/supervisor/scripy.supervisor.module");
const general_module_1 = require("./orchestration/modules/main/general.module");
const leads_module_1 = require("./orchestration/modules/leads/leads.module");
const communication_module_1 = require("./orchestration/modules/communication/communication.module");
const campaigns_module_1 = require("./orchestration/modules/campaigns/campaigns.module");
const system_module_1 = require("./orchestration/modules/system/system.module");
const users_module_1 = require("./orchestration/modules/users/users.module");
const media_module_1 = require("./orchestration/modules/media/media.module");
const ads_module_1 = require("./orchestration/modules/ads/ads.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const env_validation_1 = require("./config/env.validation");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: env_validation_1.validateEnv,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            scripy_supervisor_module_1.ScripySupervisorModule,
            general_module_1.GeneralModule,
            leads_module_1.LeadsModule,
            communication_module_1.CommunicationModule,
            campaigns_module_1.CampaignsModule,
            system_module_1.SystemModule,
            users_module_1.UsersModule,
            media_module_1.MediaModule,
            ads_module_1.AdsModule,
        ],
        controllers: [app_controller_1.AppController, orchestration_controller_1.OrchestrationController],
        providers: [app_service_1.AppService, orchestration_service_1.OrchestrationService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map