import { OrchestrationService } from './orchestration.service';
import { GraphInputDto } from './dto/graph-input.dto';
export declare class OrchestrationController {
    private readonly orchestrationService;
    constructor(orchestrationService: OrchestrationService);
    runGraph(input: GraphInputDto, req: any): Promise<{
        success: boolean;
        data: {
            messages: {
                role: import("@langchain/core/messages").MessageType;
                content: string | (import("@langchain/core/messages").ContentBlock | import("@langchain/core/messages").ContentBlock.Text)[];
            }[];
            usage_stats: Record<string, any>;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
