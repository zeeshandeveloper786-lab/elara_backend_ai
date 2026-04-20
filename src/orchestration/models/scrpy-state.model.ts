import { BaseMessage } from '@langchain/core/messages';

export enum SupervisorType {
  SCRIPY = 'ScripySupervisor',
  GENERAL = 'GeneralAgent',
  LEADS = 'LeadEnrichmentSupervisor',
  SYSTEM = 'SystemInsightSupervisor',
  USERS = 'UserInsightsSupervisor',
  COMMUNICATION = 'CommunicationProposalSupervisor',
  CAMPAIGN = 'CampaignSupervisor',
  MEDIA = 'MediaGeneratorSupervisor',
  ADS = 'AdsContentGeneratorSupervisor',
}

export type PlannedTask = {
  id: string;
  supervisor: SupervisorType;
  instruction: string;
};

export interface ScrpyState {
  messages: BaseMessage[];
  next?: SupervisorType | 'FINISH';
  sender?: string;
  job_id?: string;
  user_id: string;
  user_name: string;
  authorization: string;
  usage_stats: Record<string, any>;
  valid_companies: string[];
  company_id?: string;
  campaign_id?: string;

  // Multi-step orchestration
  user_request?: string;
  reasoning?: string;
  analysis?: string;
  tasks?: PlannedTask[];
  task_cursor?: number;
  current_task?: string;
  task_summaries?: string[];

  // Memory & Context Awareness
  memory?: string; // Compiled long-term memory/facts
  tool_history?: string; // Summary of recent tool results to avoid repetition
  conversation_summary?: string; // Rolling summary of distilled history
  memory_to_save?: any[]; // Temporary queue for new memories to be persisted

  // Supervisor Counters for Loop Protection
  lead_supervisor_calls?: number;
  system_supervisor_calls?: number;
  user_supervisor_calls?: number;
  comm_supervisor_calls?: number;
  campaign_supervisor_calls?: number;
  ads_supervisor_calls?: number;
  media_supervisor_calls?: number;
}
