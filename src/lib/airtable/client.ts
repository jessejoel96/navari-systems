type AirtableRecord<T extends Record<string, unknown>> = {
  id: string;
  createdTime: string;
  fields: T;
};

type AirtableListResponse<T extends Record<string, unknown>> = {
  records: AirtableRecord<T>[];
};

type AirtableCreateResponse<T extends Record<string, unknown>> = {
  records: AirtableRecord<T>[];
};

function getAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_DISCOVERY_TABLE ?? "Discovery Sessions";

  if (!apiKey || !baseId) {
    return null;
  }

  return { apiKey, baseId, tableName };
}

function tableUrl(tableName: string, recordId?: string) {
  const config = getAirtableConfig();
  if (!config) throw new Error("Airtable is not configured");

  const encoded = encodeURIComponent(tableName);
  const base = `https://api.airtable.com/v0/${config.baseId}/${encoded}`;
  return recordId ? `${base}/${recordId}` : base;
}

async function airtableFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const config = getAirtableConfig();
  if (!config) {
    throw new Error("AIRTABLE_API_KEY and AIRTABLE_BASE_ID must be set");
  }

  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Airtable error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export function isAirtableConfigured(): boolean {
  return getAirtableConfig() !== null;
}

export async function createRecord<T extends Record<string, unknown>>(
  fields: T
): Promise<AirtableRecord<T>> {
  const config = getAirtableConfig();
  if (!config) throw new Error("Airtable is not configured");

  const data = await airtableFetch<AirtableCreateResponse<T>>(tableUrl(config.tableName), {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }] }),
  });

  const record = data.records[0];
  if (!record) throw new Error("Airtable returned no record");
  return record;
}

export async function updateRecord<T extends Record<string, unknown>>(
  recordId: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  const config = getAirtableConfig();
  if (!config) throw new Error("Airtable is not configured");

  const data = await airtableFetch<{ records: AirtableRecord<T>[] }>(
    tableUrl(config.tableName),
    {
      method: "PATCH",
      body: JSON.stringify({ records: [{ id: recordId, fields }] }),
    }
  );

  const record = data.records[0];
  if (!record) throw new Error("Airtable returned no record");
  return record;
}

export async function findRecordByFormula<T extends Record<string, unknown>>(
  formula: string
): Promise<AirtableRecord<T> | null> {
  const config = getAirtableConfig();
  if (!config) throw new Error("Airtable is not configured");

  const url = `${tableUrl(config.tableName)}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;
  const data = await airtableFetch<AirtableListResponse<T>>(url);
  return data.records[0] ?? null;
}
