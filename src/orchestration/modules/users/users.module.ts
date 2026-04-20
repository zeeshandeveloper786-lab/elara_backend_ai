import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { UserInsightsSupervisorService } from './supervisor/user-insights.supervisor';
import { UserInsightAgentService } from './agent/user-insight.agent';
import { GetUserProfileService } from './tools/get-user-profile/get-user-profile.service';
import { UpdateUserProfileService } from './tools/update-user-profile/update-user-profile.service';
import { ChangeUserPasswordService } from './tools/change-user-password/change-user-password.service';
import { DeleteUserService } from './tools/delete-user/delete-user.service';
import { UsersToolsService } from './tools/users-tools.service';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    UserInsightsSupervisorService,
    UserInsightAgentService,
    GetUserProfileService,
    UpdateUserProfileService,
    ChangeUserPasswordService,
    DeleteUserService,
    UsersToolsService,
  ],
  exports: [
    UserInsightsSupervisorService,
    UserInsightAgentService,
    GetUserProfileService,
    UpdateUserProfileService,
    ChangeUserPasswordService,
    DeleteUserService,
    UsersToolsService,
  ],
})
export class UsersModule {}
