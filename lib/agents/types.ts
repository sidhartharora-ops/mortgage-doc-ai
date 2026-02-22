export interface AgentOptions {
  deterministic?: boolean;
}

export interface AgentMetadata {
  latency_ms: number;
  model_used: string;
  input_hash: string;
  output_hash: string;
}

export interface AgentResult {
  agent_name: string;
  version: string;
  status: "success" | "failure";
  confidence_overall: number;
  output: unknown;
  metadata: AgentMetadata;
}

export interface Agent {
  name: string;
  version: string;
  run(input: unknown, options?: AgentOptions): Promise<AgentResult>;
}
