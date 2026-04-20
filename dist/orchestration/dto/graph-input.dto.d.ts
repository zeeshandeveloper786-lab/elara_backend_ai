export declare class PlannedTaskDto {
    id: string;
    supervisor: 'GeneralAgent' | 'LeadEnrichmentSupervisor' | 'SystemInsightSupervisor' | 'UserInsightsSupervisor' | 'CommunicationProposalSupervisor' | 'CampaignSupervisor' | 'MediaGeneratorSupervisor' | 'AdsContentGeneratorSupervisor';
    instruction: string;
}
export declare class MessageDto {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    name?: string;
    tool_call_id?: string;
    tool_calls?: any[];
}
export declare class GraphInputDto {
    messages: MessageDto[];
    user_id?: string;
    user_name?: string;
    authorization?: string;
    company_id?: string;
    campaign_id?: string;
    job_id?: string;
    usage_stats?: Record<string, any>;
    valid_companies?: string[];
    next?: string;
    user_request?: string;
    tasks?: PlannedTaskDto[];
    task_cursor?: number;
    task_summaries?: string[];
}
