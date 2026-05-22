import Anthropic from "@anthropic-ai/sdk"
import { supabaseAdmin } from "@/lib/supabase"

export interface StepLog {
  step: number
  tool: string
  input: unknown
  output: unknown
  duration_ms: number
  timestamp: string
}

export interface AgentResult {
  runId: string
  output: unknown
  steps: StepLog[]
  tokensUsed: number
  durationMs: number
}

export async function runAgent({
  agentType,
  input,
  systemPrompt,
  userMessage,
  tools,
  toolHandlers,
  maxIterations = 10,
}: {
  agentType: string
  input: Record<string, unknown>
  systemPrompt: string
  userMessage: string
  tools: Anthropic.Tool[]
  toolHandlers: Record<string, (input: unknown) => Promise<unknown>>
  maxIterations?: number
}): Promise<AgentResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const startTime = Date.now()
  const steps: StepLog[] = []
  let tokensUsed = 0

  // Create run record
  const { data: run } = await supabaseAdmin
    .from("agent_runs")
    .insert({ agent_type: agentType, input, status: "running", steps: [] })
    .select("id")
    .single()

  const runId = run?.id ?? crypto.randomUUID()

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ]

  let finalOutput: unknown = null

  try {
    for (let i = 0; i < maxIterations; i++) {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: systemPrompt,
        tools,
        messages,
      })

      tokensUsed += response.usage.input_tokens + response.usage.output_tokens

      if (response.stop_reason === "end_turn") {
        const textBlock = response.content.find(b => b.type === "text") as { text: string } | undefined
        // Try to parse JSON from the final response
        if (textBlock?.text) {
          try {
            const match = textBlock.text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
            finalOutput = match ? JSON.parse(match[0]) : textBlock.text
          } catch {
            finalOutput = textBlock.text
          }
        }
        break
      }

      if (response.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: response.content })

        const toolResults: Anthropic.ToolResultBlockParam[] = []

        for (const block of response.content) {
          if (block.type !== "tool_use") continue

          const toolStart = Date.now()
          let result: unknown

          try {
            const handler = toolHandlers[block.name]
            if (!handler) throw new Error(`No handler for tool: ${block.name}`)
            result = await handler(block.input)
          } catch (err) {
            result = { error: err instanceof Error ? err.message : "Tool failed" }
          }

          const step: StepLog = {
            step: steps.length + 1,
            tool: block.name,
            input: block.input,
            output: result,
            duration_ms: Date.now() - toolStart,
            timestamp: new Date().toISOString(),
          }
          steps.push(step)

          // Live-update steps in DB so monitoring page sees progress
          await supabaseAdmin
            .from("agent_runs")
            .update({ steps, updated_at: new Date().toISOString() })
            .eq("id", runId)

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          })
        }

        messages.push({ role: "user", content: toolResults })
      }
    }

    const durationMs = Date.now() - startTime

    await supabaseAdmin
      .from("agent_runs")
      .update({
        status: "completed",
        output: { result: finalOutput },
        steps,
        tokens_used: tokensUsed,
        duration_ms: durationMs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId)

    return { runId, output: finalOutput, steps, tokensUsed, durationMs }

  } catch (err) {
    const durationMs = Date.now() - startTime
    await supabaseAdmin
      .from("agent_runs")
      .update({
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
        steps,
        duration_ms: durationMs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId)
    throw err
  }
}
