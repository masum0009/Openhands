// Agent types
export interface Agent {
  id: number;
  name: string;
  description: string | null;
  system_prompt: string;
  voice_id: string;
  voice_speed: number;
  voice_pitch: number;
  stt_provider: string;
  llm_provider: string;
  tts_provider: string;
  llm_model: string;
  webhook_url: string | null;
  is_active: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string | null;
}

export interface AgentCreate {
  name: string;
  description?: string;
  system_prompt?: string;
  voice_id?: string;
  voice_speed?: number;
  voice_pitch?: number;
  stt_provider?: string;
  llm_provider?: string;
  tts_provider?: string;
  llm_model?: string;
  webhook_url?: string;
  is_active?: boolean;
}

export interface AgentUpdate {
  name?: string;
  description?: string;
  system_prompt?: string;
  voice_id?: string;
  voice_speed?: number;
  voice_pitch?: number;
  stt_provider?: string;
  llm_provider?: string;
  tts_provider?: string;
  llm_model?: string;
  webhook_url?: string;
  is_active?: boolean;
}
