const cheerio = require("cheerio");
const fetch = require("node-fetch");

const baseUrl = "https://red-oryx-435931.hostingersite.com";

function parseAsri(html) {
  const match = html.match(/<!--\\s*ASRI([\\s\\S]*?)-->/i);
  if (!match) return null;

  const lines = match[1].split("\n").map((l) => l.trim()).filter(Boolean);
  const data = {};
  lines.forEach((line) => {
    const [key, val] = line.split(":").map((s) => s.trim().toLowerCase());
    if (key === "compatibilecon") {
      data[key] = val.split(",").map((v) => v.trim());
    } else {
      data[key] = val;
    }
  });

  return data;
}

module.exports = async (req, res) => {
  try {
    const adottaRes = await fetch(`${baseUrl}/adotta-ora/`);
    const adottaHtml = await adottaRes.text();
    const $ = cheerio.load(adottaHtml);

    const links = new Set();
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith(baseUrl + "/") && !href.includes("/adotta-ora/")) {
        links.add(href.split("?")[0]);
      }
    });

    const output = [];

    for (const link of links) {
      try {
        const resp = await fetch(link);
        const html = await resp.text();
        const parsed = parseAsri(html);
        if (parsed) {
          const name = link.split("/").filter(Boolean).pop();
          output.push({
            nome: name,
            sesso: parsed.sesso,
            compatibileCon: parsed.compatibilecon || [],
            gatti: parsed.gatti === "sì",
            bambini: parsed.bambini === "sì",
            attivita: parsed.attivita,
            link,
            descrizione: `Scopri ${name}`
          });
        }
      } catch (err) {
        console.log("Errore fetch pagina:", link);
      }
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(output);
  } catch (e) {
    console.error("Errore update-json:", e);
    res.status(500).json({ errore: true });
  }
};
