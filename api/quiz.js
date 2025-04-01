const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { risposte } = req.body;

  const prompt = `
Le risposte dell'utente sono: ${JSON.stringify(risposte)}.

Elenco dei cani disponibili:
- Maya: giovane, tranquilla, vive con gatta, non adatta a bambini.
- Thor: sensibile ai rumori, non ama contesti urbani.
- Django: ha epilessia, adatto a contesti tranquilli.
- Blue: ha bisogno di guida e tempo per adattarsi, no gatti.
- Ziggy: indipendente, richiede fiducia e spazio, non abituato ai bambini.
- Polpetta: ex maltrattato, no bambini o cani maschi.
- Ron, Draco e Sirius: fratelli equilibrati, vivono in campagna, abituati a persone e bambini.

In base alle risposte dell'utente, suggerisci TUTTI i cani compatibili (anche più di uno se possibile). 
Per ciascun cane suggerito, spiega brevemente perché potrebbe essere adatto.
Se nessuno dei cani è compatibile, rispondi con gentilezza che al momento non ci sono cani perfetti ma potremmo ricontattarlo in futuro.
Scrivi tutto in tono dolce, empatico e in italiano.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const risultato = completion.choices[0].message.content;
    res.status(200).json({ risultato });
  } catch (error) {
    console.error(error);
    res.status(500).json({ risultato: "Errore AI." });
  }
};
