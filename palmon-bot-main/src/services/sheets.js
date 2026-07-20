const config = require("../config");
const fetch = require("../fetch");

let sheetCache = {
  data: null,
  lastFetch: 0
};

let attrCache = {
  map: null,
  lastFetch: 0
};

const CACHE_TTL = 60 * 1000;

function parseGoogleSheetJson(text) {
  return JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
  );
}

async function getSheetData() {
  const now = Date.now();

  if (sheetCache.data && (now - sheetCache.lastFetch < CACHE_TTL)) {
    return sheetCache.data;
  }

  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:json&gid=${config.gidPlayers || "307583676"}`
  );
  const json = parseGoogleSheetJson(await res.text());

  const players = json.table.rows.map(r => ({
    pseudo: r.c[0]?.v || "Inconnu",
    mons: [r.c[1]?.v, r.c[2]?.v, r.c[3]?.v, r.c[4]?.v].filter(Boolean)
  }));

  sheetCache = {
    data: players,
    lastFetch: now
  };

  return players;
}

async function getAttributesMap() {
  const now = Date.now();

  if (attrCache.map && (now - attrCache.lastFetch < CACHE_TTL)) {
    return attrCache.map;
  }

  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${config.sheetId}/gviz/tq?tqx=out:json&gid=${config.gidAttr}`
  );
  const json = parseGoogleSheetJson(await res.text());
  const map = {};

  json.table.rows.forEach(r => {
    const id = String(r.c[0]?.v).trim().padStart(3, "0");

    map[id] = {
      id,
      category: r.c[1]?.v || "?",
      fr: r.c[2]?.v || "?",
      en: r.c[3]?.v || "?",
      es: r.c[4]?.v || "?",
      de: r.c[5]?.v || "?"
    };
  });

  attrCache = {
    map,
    lastFetch: now
  };

  return map;
}

async function postSheetApi(body) {
  const res = await fetch(config.sheetApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return res.json().catch(() => null);
}

module.exports = {
  getSheetData,
  getAttributesMap,
  postSheetApi
};
