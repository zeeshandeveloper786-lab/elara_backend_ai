import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { MediaGeneratorSupervisorService } from './supervisor/media-generator.supervisor';
import { MediaGeneratorAgentService } from './agent/media-generator.agent';
import { GenerateMediaService } from './tools/generate-media/generate-media.service';
import { MediaToolsService } from './tools/media-tools.service';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    MediaGeneratorSupervisorService,
    MediaGeneratorAgentService,
    GenerateMediaService,
    MediaToolsService,
  ],
  exports: [
    MediaGeneratorSupervisorService,
    MediaGeneratorAgentService,
    GenerateMediaService,
    MediaToolsService,
  ],
})
export class MediaModule {}
