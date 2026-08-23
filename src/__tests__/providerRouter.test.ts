import { selectProvider } from "../services/providerRouter";

describe("selectProvider", () => {
  it("routes OpenAI models to the OpenAI provider", () => {
    const provider = selectProvider("gpt-4o-mini");
    expect(provider.name).toBe("openai");
  });

  it("routes Groq models to the Groq provider", () => {
    const provider = selectProvider("openai/gpt-oss-20b");
    expect(provider.name).toBe("groq");
  });

  it("routes Ollama models to the Ollama provider", () => {
    const provider = selectProvider("llama3.2:1b");
    expect(provider.name).toBe("ollama");
  });

  it("defaults to OpenAI for unrecognized models", () => {
    const provider = selectProvider("some-unknown-model");
    expect(provider.name).toBe("openai");
  });
});
