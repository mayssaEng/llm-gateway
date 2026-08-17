// Stockage temporaire en mémoire — sera remplacé par MongoDB à l'étape suivante
export interface ApiKeyRecord {
  key: string;
  owner: string;
  active: boolean;
}

export const apiKeys: ApiKeyRecord[] = [
  { key: "sk-gateway-support-001", owner: "chatbot-support", active: true },
  { key: "sk-gateway-marketing-001", owner: "marketing-tool", active: true },
];

export function findApiKey(key: string): ApiKeyRecord | undefined {
  return apiKeys.find((k) => k.key === key && k.active);
}