import { Module } from '@nestjs/common';
import { ScripySupervisorService } from './scripy.supervisor';
import { createModel } from '../../../AI-model/openai-model';
import { ChatOpenAI } from '@langchain/openai';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    ScripySupervisorService,
  ],
  exports: [ScripySupervisorService],
})
export class ScripySupervisorModule {}
