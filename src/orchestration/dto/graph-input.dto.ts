import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PlannedTaskDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  supervisor:
    | 'GeneralAgent'
    | 'LeadEnrichmentSupervisor'
    | 'SystemInsightSupervisor'
    | 'UserInsightsSupervisor'
    | 'CommunicationProposalSupervisor'
    | 'CampaignSupervisor'
    | 'MediaGeneratorSupervisor'
    | 'AdsContentGeneratorSupervisor';

  @IsString()
  @IsNotEmpty()
  instruction: string;
}

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  role: 'system' | 'user' | 'assistant' | 'tool';

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tool_call_id?: string;

  @IsOptional()
  @IsArray()
  tool_calls?: any[];
}

export class GraphInputDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  authorization?: string;

  // Optional business context (needed for DB relations + analytics)
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsString()
  campaign_id?: string;

  @IsOptional()
  @IsString()
  job_id?: string;

  @IsOptional()
  usage_stats?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  valid_companies?: string[];

  @IsOptional()
  @IsString()
  next?: string;

  // Multi-step orchestration (optional; can be set by planner or tests)
  @IsOptional()
  @IsString()
  user_request?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlannedTaskDto)
  tasks?: PlannedTaskDto[];

  @IsOptional()
  @IsNumber()
  task_cursor?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  task_summaries?: string[];
}
