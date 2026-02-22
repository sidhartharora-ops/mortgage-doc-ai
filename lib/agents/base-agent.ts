import crypto from "crypto";
import { Agent, AgentOptions, AgentResult } from "./types";

export abstract class BaseAgent implements Agent {
  abstract name: string;
  abstract version: string;

  protected abstract execute(input: unknown): Promise<{ output: unknown; confidence: number; model: string }>;
  protected abstract getFixtureOutput(input: unknown): unknown;

  async run(input: unknown, options?: AgentOptions): Promise<AgentResult> {
    const startTime = Date.now();
    const inputHash = this.hash(input);

    if (options?.deterministic || process.env.DETERMINISTIC_MODE === "true") {
      const output = this.getFixtureOutput(input);
      const outputHash = this.hash(output);
      return {
        agent_name: this.name,
        version: this.version,
        status: "success",
        confidence_overall: 1.0,
        output,
        metadata: {
          latency_ms: Date.now() - startTime,
          model_used: "deterministic-fixture",
          input_hash: inputHash,
          output_hash: outputHash,
        },
      };
    }

    try {
      const result = await this.execute(input);
      const outputHash = this.hash(result.output);
      return {
        agent_name: this.name,
        version: this.version,
        status: "success",
        confidence_overall: result.confidence,
        output: result.output,
        metadata: {
          latency_ms: Date.now() - startTime,
          model_used: result.model,
          input_hash: inputHash,
          output_hash: outputHash,
        },
      };
    } catch (error) {
      return {
        agent_name: this.name,
        version: this.version,
        status: "failure",
        confidence_overall: 0,
        output: { error: error instanceof Error ? error.message : "Unknown error" },
        metadata: {
          latency_ms: Date.now() - startTime,
          model_used: "none",
          input_hash: inputHash,
          output_hash: "",
        },
      };
    }
  }

  protected hash(data: unknown): string {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }
}
