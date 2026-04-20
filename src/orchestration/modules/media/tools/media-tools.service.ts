import { Injectable } from '@nestjs/common';
import { GenerateMediaService } from './generate-media/generate-media.service';

@Injectable()
export class MediaToolsService {
  constructor(private generateMediaService: GenerateMediaService) {}

  getTools() {
    return [this.getGenerateMediaTool()];
  }

  getGenerateMediaTool() {
    return {
      service: this.generateMediaService,
      name: 'generate_media',
      description:
        'Generates professional AI images using Flux-1 Schnell model via OpenRouter. Saves images to storage and provides public URLs.',
    };
  }
}
