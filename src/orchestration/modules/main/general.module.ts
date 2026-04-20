import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { GeneralAgentService } from './agent/general.agent';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    GeneralAgentService,
  ],
  exports: [GeneralAgentService],
})
export class GeneralModule {}
