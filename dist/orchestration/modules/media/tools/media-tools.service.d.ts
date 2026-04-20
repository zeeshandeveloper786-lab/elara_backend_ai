import { GenerateMediaService } from './generate-media/generate-media.service';
export declare class MediaToolsService {
    private generateMediaService;
    constructor(generateMediaService: GenerateMediaService);
    getTools(): {
        service: GenerateMediaService;
        name: string;
        description: string;
    }[];
    getGenerateMediaTool(): {
        service: GenerateMediaService;
        name: string;
        description: string;
    };
}
