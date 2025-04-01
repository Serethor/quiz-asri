const { OpenAI } = require("openai");
const cheerio = require("cheerio");
const fetch = require("node-fetch");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function parseAsriBlock(html) {
  const regex = /<!--\s*ASRI([\s\S]*?)-->/i;
  const match = html.match(regex);
  if (!match) return null;

  const lines = match[1].split("\n").map((line) => line.trim()).filter(Boolean);
  const data = {};

  lines.forEach((line) => {
    const [key, value] = line.split(":").map((x) => x.trim().toLowerCase());
    if (key && value) {
      if (key === "compatibilecon") {
        data[key] = value.split(",").map((v) => v.trim());
      } else {
        data[key] = value;
      }
    }
  });

  return data;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const { risposte } = req.body;
  const baseUrl = "https://red-oryx-435931.hostingersite.com";
  const adottaUrl = `${baseUrl}/adotta-ora/`;

  let caniCompatibili = [];

  try {
    const adottaResp = await fetch(adottaUrl);
    const adottaHtml = await adottaResp.text();
    const $ = cheerio.load(adottaHtml);

    const links = new Set();
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith(baseUrl + "/") && !href.includes("/adotta-ora/")) {
        links.add(href.split("?")[0]);
      }
    });

    for (const link of links) {
      try {
        const page = await fetch(link);
        const html = await page.text();
        const asri = parseAsriBlock(html);
        if (!asri) continue;

        caniCompatibili.push({
          nome: link.split("/").filter(Boolean).pop(),
          sesso: asri.sesso,
          compatibileCon: asri.compatibilecon || [],
          gatti: asri.gatti === "sì",
          bambini: asri.bambini === "sì",
          attivita: asri.attivita,
          link,
          descrizione: `Scheda di ${link.split("/").filter(Boolean).pop()}`,
        });
      } catch (err) {
        console.warn("Errore lettura scheda:", link);
      }
    }

    // FILTRI
    const haCani = risposte.haCani === "Sì";
    const sessoCani = risposte.sessoCani;
    const stessoSesso = risposte.stessoSesso;
    const sessoOpposto = risposte.sessoOpposto;
    const haGatti = risposte.haGatti === "Sì";
    const haBambini = risposte.bambini === "Sì";
    const attivitaUtente = risposte.attivitaFisica;

    if (haCani) {
      const escludiMaschi =
        (sessoCani === "Maschi" || sessoCani === "Entrambi") && stessoSesso === "No" ||
        (sessoCani === "Femmine" || sessoCani === "Entrambi") && sessoOpposto === "No";

      const escludiFemmine =
        (sessoCani === "Femmine" || sessoCani === "Entrambi") && stessoSesso === "No" ||
        (sessoCani === "Maschi" || sessoCani === "Entrambi") && sessoOpposto === "No";

      caniCompatibili = caniCompatibili.filter((cane) => {
        if (escludiMaschi && cane.sesso === "maschio") return false;
        if (escludiFemmine && cane.sesso === "femmina") return false;
        if (sessoCani === "Maschi" && !cane.compatibileCon.includes("maschi")) return false;
        if (sessoCani === "Femmine" && !cane.compatibileCon.includes("femmine")) return false;
        if (sessoCani === "Entrambi" && !cane.compatibileCon.includes("maschi") && !cane.compatibileCon.includes("femmine")) return false;
        return true;
      });
    }

    if (haGatti) {
      caniCompatibili = caniCompatibili.filter((cane) => cane.gatti);
    }

    if (haBambini) {
      caniCompatibili = caniCompatibili.filter((cane) => cane.bambini);
    }

    if (attivitaUtente === "Faccio passeggiate lunghe o escursioni regolarmente") {
      caniCompatibili = caniCompatibili.filter((cane) => ["alta", "media", "adattabile"].includes(cane.attivita));
    } else if (attivitaUtente === "Passeggio ogni giorno ma non troppo a lungo") {
      caniCompatibili = caniCompatibili.filter((cane) => ["media", "bassa", "adattabile"].includes(cane.attivita));
    } else if (attivitaUtente === "Ho uno stile di vita molto tranquillo/sedentario") {
      caniCompatibili = caniCompatibili.filter((cane) => ["bassa", "adattabile"].includes(cane.attivita));
    }

    const elencoCani = caniCompatibili
      .map(
        (cane) => `- <strong>${cane.nome}</strong>: ${cane.descrizione}<br/><a href="${cane.link}" target="_blank">Vai alla scheda di ${cane.nome}</a><br/>`
      )
      .join("<br/>");

    const prompt = `
Questi sono i cani compatibili in base alle risposte dell'utente:
${elencoCani || "(nessun cane disponibile)"}

Scrivi una risposta empatica e in tono dolce per l'utente.
Se non ci sono cani disponibili, spiega gentilmente che al momento non ci sono opzioni adatte, ma che potremmo ricontattarlo in futuro.
Usa HTML per i link. Scrivi in italiano.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const risultato = completion.choices[0].message.content;
    res.status(200).json({ risultato });
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({ risultato: "Errore AI." });
  }
};
