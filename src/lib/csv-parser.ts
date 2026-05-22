/**
 * Client-side CSV parser with smart column detection.
 * No external dependencies.
 */

export interface ParsedPlace {
  name: string;
  area: string;
  note: string;
}

export interface ParseResult {
  places: ParsedPlace[];
  detectedColumns: {
    name: string | null;
    area: string | null;
    note: string | null;
  };
  rowCount: number;
  skippedRows: number;
}

const MAX_PLACES = 50;

const NAME_HEADERS = new Set([
  "name",
  "place",
  "restaurant",
  "spot",
  "cafe",
  "bar",
  "shop",
  "store",
  "venue",
  "title",
]);

const AREA_HEADERS = new Set([
  "area",
  "address",
  "location",
  "neighbourhood",
  "neighborhood",
  "locality",
  "city",
  "place_area",
]);

const NOTE_HEADERS = new Set([
  "note",
  "notes",
  "description",
  "comment",
  "review",
  "take",
  "why",
]);

/**
 * Parse a single CSV line, respecting quoted fields.
 *
 * Handles:
 *  - Fields wrapped in double quotes (commas inside are preserved)
 *  - Escaped quotes inside quoted fields (doubled: "")
 *  - Mixed quoted and unquoted fields on the same row
 */
function parseLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        // Look ahead: doubled quote is an escaped literal quote
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
          continue;
        }
        // End of quoted field
        inQuotes = false;
        i++;
        continue;
      }
      current += ch;
      i++;
    } else {
      if (ch === '"') {
        // Start of quoted field (only valid at field start or after comma)
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ",") {
        fields.push(current.trim());
        current = "";
        i++;
        continue;
      }
      current += ch;
      i++;
    }
  }

  // Push the last field
  fields.push(current.trim());
  return fields;
}

/**
 * Determine whether the first row looks like headers rather than data.
 *
 * A row is considered a header row if at least one cell matches a known
 * header keyword. This avoids misinterpreting a place name that happens
 * to be a single common word.
 */
function isHeaderRow(fields: string[]): boolean {
  return fields.some((f) => {
    const lower = f.toLowerCase().trim();
    return NAME_HEADERS.has(lower) || AREA_HEADERS.has(lower) || NOTE_HEADERS.has(lower);
  });
}

/**
 * Detect which column index maps to name/area/note based on header values.
 */
function detectColumns(headers: string[]): {
  nameIdx: number;
  areaIdx: number;
  noteIdx: number;
  detectedColumns: ParseResult["detectedColumns"];
} {
  let nameIdx = -1;
  let areaIdx = -1;
  let noteIdx = -1;

  const detectedColumns: ParseResult["detectedColumns"] = {
    name: null,
    area: null,
    note: null,
  };

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().trim();

    if (nameIdx === -1 && NAME_HEADERS.has(h)) {
      nameIdx = i;
      detectedColumns.name = headers[i].trim();
    } else if (areaIdx === -1 && AREA_HEADERS.has(h)) {
      areaIdx = i;
      detectedColumns.area = headers[i].trim();
    } else if (noteIdx === -1 && NOTE_HEADERS.has(h)) {
      noteIdx = i;
      detectedColumns.note = headers[i].trim();
    }
  }

  return { nameIdx, areaIdx, noteIdx, detectedColumns };
}

/**
 * Parse CSV text into structured place data.
 *
 * - Auto-detects header rows and maps columns by keyword
 * - Falls back to positional mapping (col 0 = name, 1 = area, 2 = note)
 * - Handles quoted fields with embedded commas
 * - Skips empty rows
 * - Caps output at 50 places
 */
export function parseCSV(csvText: string): ParseResult {
  // Normalise line endings and split
  const lines = csvText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  if (lines.length === 0) {
    return {
      places: [],
      detectedColumns: { name: null, area: null, note: null },
      rowCount: 0,
      skippedRows: 0,
    };
  }

  // Find the first non-empty line
  let startIdx = 0;
  while (startIdx < lines.length && lines[startIdx].trim() === "") {
    startIdx++;
  }

  if (startIdx >= lines.length) {
    return {
      places: [],
      detectedColumns: { name: null, area: null, note: null },
      rowCount: 0,
      skippedRows: 0,
    };
  }

  const firstFields = parseLine(lines[startIdx]);
  const hasHeaders = isHeaderRow(firstFields);

  let nameIdx: number;
  let areaIdx: number;
  let noteIdx: number;
  let detectedColumns: ParseResult["detectedColumns"];
  let dataStartIdx: number;

  if (hasHeaders) {
    const detected = detectColumns(firstFields);
    nameIdx = detected.nameIdx;
    areaIdx = detected.areaIdx;
    noteIdx = detected.noteIdx;
    detectedColumns = detected.detectedColumns;
    dataStartIdx = startIdx + 1;

    // If header row exists but no name column was matched, fall back to col 0
    if (nameIdx === -1) {
      nameIdx = 0;
      detectedColumns.name = firstFields[0]?.trim() || null;
    }
    // Fill unmatched area/note with next available columns
    if (areaIdx === -1) {
      for (let i = 0; i < firstFields.length; i++) {
        if (i !== nameIdx && i !== noteIdx) {
          areaIdx = i;
          detectedColumns.area = firstFields[i]?.trim() || null;
          break;
        }
      }
    }
    if (noteIdx === -1) {
      for (let i = 0; i < firstFields.length; i++) {
        if (i !== nameIdx && i !== areaIdx) {
          noteIdx = i;
          detectedColumns.note = firstFields[i]?.trim() || null;
          break;
        }
      }
    }
  } else {
    // Positional fallback: col 0 = name, col 1 = area, col 2 = note
    nameIdx = 0;
    areaIdx = 1;
    noteIdx = 2;
    detectedColumns = { name: null, area: null, note: null };
    dataStartIdx = startIdx;
  }

  const places: ParsedPlace[] = [];
  let skippedRows = 0;

  for (let i = dataStartIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") {
      skippedRows++;
      continue;
    }

    const fields = parseLine(lines[i]);

    // A row needs at least a name to be valid
    const name = (nameIdx >= 0 && nameIdx < fields.length ? fields[nameIdx] : "").trim();
    if (name === "") {
      skippedRows++;
      continue;
    }

    if (places.length >= MAX_PLACES) {
      skippedRows++;
      continue;
    }

    const area = (areaIdx >= 0 && areaIdx < fields.length ? fields[areaIdx] : "").trim();
    const note = (noteIdx >= 0 && noteIdx < fields.length ? fields[noteIdx] : "").trim();

    places.push({ name, area, note });
  }

  return {
    places,
    detectedColumns,
    rowCount: places.length,
    skippedRows,
  };
}
