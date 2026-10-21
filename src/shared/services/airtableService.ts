/**
 * Optional Airtable module: not imported by the app by default. Use it only when a
 * project reads Airtable (setup: README § Airtable, .agents/skills/api-integrate/).
 */
import Airtable from "airtable";

const airtableApiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
const airtableBaseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
const airtableTableId = import.meta.env.VITE_AIRTABLE_TABLE_ID;

let airtableBase: Airtable.Base | null = null;

/**
 * Check if Airtable is configured
 */
export const isAirtableConfigured = (): boolean => {
  return !!(
    airtableApiKey &&
    airtableBaseId &&
    airtableTableId &&
    airtableApiKey !== "your-api-key" &&
    airtableBaseId !== "your-base-id" &&
    airtableTableId !== "your-table-id"
  );
};

/**
 * Initialize Airtable client if configured
 */
export const initAirtable = (): Airtable.Base | null => {
  if (!isAirtableConfigured() || !airtableApiKey || !airtableBaseId) {
    return null;
  }

  if (!airtableBase) {
    const airtable = new Airtable({ apiKey: airtableApiKey });
    airtableBase = airtable.base(airtableBaseId);
  }

  return airtableBase;
};

/**
 * Get Airtable base (throws if not configured)
 */
export const getAirtableBase = (): Airtable.Base => {
  if (!isAirtableConfigured() || !airtableApiKey || !airtableBaseId) {
    throw new Error("Airtable is not configured. Please complete the setup wizard.");
  }

  if (!airtableBase) {
    const airtable = new Airtable({ apiKey: airtableApiKey });
    airtableBase = airtable.base(airtableBaseId);
  }

  return airtableBase;
};

/**
 * Get Airtable table ID from environment
 */
export const getAirtableTableId = (): string => {
  if (!airtableTableId || airtableTableId === "your-table-id") {
    throw new Error("Airtable table ID is not configured.");
  }
  return airtableTableId;
};

/**
 * Airtable field structure
 */
export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

/**
 * Airtable table structure
 */
export interface AirtableTableStructure {
  id: string;
  name: string;
  fields: AirtableField[];
}

/**
 * Test Airtable connection
 */
export const testAirtableConnection = async (
  apiKey: string,
  baseId: string,
  tableId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);
    const table = base(tableId);

    // Try to fetch first record to test connection
    await table.select({ maxRecords: 1 }).firstPage();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to Airtable",
    };
  }
};

/**
 * Get Airtable table structure using Meta API
 */
export const getAirtableTableStructure = async (
  apiKey: string,
  baseId: string,
  tableId: string
): Promise<{ success: boolean; data?: AirtableTableStructure; error?: string }> => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key. Please check your Personal Access Token.",
        };
      }
      if (response.status === 404) {
        return {
          success: false,
          error: `Base "${baseId}" not found. Please check your Base ID.`,
        };
      }
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as {
      tables: Array<{ id: string; name: string; fields: AirtableField[] }>;
    };

    // Find table by name or ID (case-sensitive for name)
    const table = data.tables.find((t) => t.name === tableId || t.id === tableId);

    if (!table) {
      return {
        success: false,
        error: `Table "${tableId}" not found in base. Please check your Table ID.`,
      };
    }

    return {
      success: true,
      data: {
        id: table.id,
        name: table.name,
        fields: table.fields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          options: f.options,
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch table structure",
    };
  }
};

// Initialize on module load if configured
if (isAirtableConfigured()) {
  initAirtable();
}
