import { createScryTool } from '../../../utils/tool-wrapper';
import { GenerateMediaService } from './generate-media/generate-media.service';

// Create services for tool creation
const generateMediaService = new GenerateMediaService();

// Generate Image Tool
export const generateImageTool = createScryTool(
  (input: any, state: any) => generateMediaService.execute(input, state),
  {
    name: 'generate_image',
    description:
      'Generates high-quality professional AI images using OpenAI DALL-E 3 model. Supports different sizes and styles.',
    schema: generateMediaService.getSchema(),
  },
);

// Media tools array for use in orchestration
export const mediaTools = [generateImageTool];
