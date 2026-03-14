// Call types
export interface Call {
  id: number;
  call_sid: string | null;
  caller_number: string | null;
  callee_number: string | null;
  status: string;
  transcript: TranscriptMessage[] | null;
  duration_seconds: number;
  recording_url: string | null;
  started_at: string;
  ended_at: string | null;
  agent_id: number;
  user_id: number;
}

export interface TranscriptMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface CallDetail extends Call {
  conversations: Conversation[];
}

export interface Conversation {
  id: number;
  role: string;
  content: string;
  audio_url: string | null;
  call_id: number;
  timestamp: string;
}
