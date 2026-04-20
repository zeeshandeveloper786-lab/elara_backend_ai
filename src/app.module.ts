import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrchestrationService } from './orchestration/orchestration.service';
import { OrchestrationController } from './orchestration/orchestration.controller';

// Domain Modules
import { ScripySupervisorModule } from './orchestration/modules/main/supervisor/scripy.supervisor.module';
import { GeneralModule } from './orchestration/modules/main/general.module';
import { LeadsModule } from './orchestration/modules/leads/leads.module';
import { CommunicationModule } from './orchestration/modules/communication/communication.module';
import { CampaignsModule } from './orchestration/modules/campaigns/campaigns.module';
import { SystemModule } from './orchestration/modules/system/system.module';
import { UsersModule } from './orchestration/modules/users/users.module';
import { MediaModule } from './orchestration/modules/media/media.module';
import { AdsModule } from './orchestration/modules/ads/ads.module';

// Base Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    // Supervisor & Agent Modules
    ScripySupervisorModule,
    GeneralModule,
    LeadsModule,
    CommunicationModule,
    CampaignsModule,
    SystemModule,
    UsersModule,
    MediaModule,
    AdsModule,
  ],
  controllers: [AppController, OrchestrationController],
  providers: [AppService, OrchestrationService],
})
export class AppModule {}
