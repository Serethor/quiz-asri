const cheerio = require("cheerio");
const fetch = require("node-fetch");

const baseUrl = "https://red-oryx-435931.hostingersite.com";
const gistId = "1d3a74a2d7604ea09135de1fbfee9b67";

function parseAsri(html) {
  const match = html.match(/<!--\s*ASRI([\s\S]*?)-->/i);
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

    for (const link of Array.from(links)) {
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

    // Scrivi nel Gist
    const gistRes = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GIST_TOKEN}`,
        "User-Agent": "ASRI-update-script"
      },
      body: JSON.stringify({
        files: {
          "cani.json": {
            content: JSON.stringify(output, null, 2)
          }
        }
      })
    });

    if (!gistRes.ok) throw new Error("Errore aggiornamento Gist");

    res.status(200).json({ success: true, count: output.length });
  } catch (e) {
    console.error("Errore update-json:", e);
    res.status(500).json({ errore: true });
  }
};
