import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrchestrationService } from './orchestration.service';
import { GraphInputDto } from './dto/graph-input.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('orchestration')
export class OrchestrationController {
  constructor(private readonly orchestrationService: OrchestrationService) {}

  @UseGuards(JwtGuard)
  @Post('run')
  @UsePipes(new ValidationPipe({ transform: true }))
  async runGraph(@Body() input: GraphInputDto, @Req() req: any) {
    try {
      // Automatically extract details from the JWT token
      const user = req.user;
      const orchestrationInput = {
        ...input,
        user_id: user.sub,
        email: user.email,
        user_name: user.user_name,
        authorization: req.headers.authorization,
      };

      const result =
        await this.orchestrationService.runOrchestration(orchestrationInput);

      // Return only the final user-facing message (hide intermediate tool/supervisor chatter)
      const last = result.messages.at(-1);
      const finalMessages = last
        ? [
            {
              role: last._getType(),
              content: last.content,
            },
          ]
        : [];

      return {
        success: true,
        data: {
          messages: finalMessages,
          usage_stats: result.usage_stats,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
