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

Elenco dei cani disponibili (con link alla loro scheda):
- Maya: giovane, tranquilla, vive con gatta, non adatta a bambini. Scheda: https://asritalia.com/adotta-ora/maya
- Thor: sensibile ai rumori, non ama contesti urbani. Scheda: https://asritalia.com/adotta-ora/thor
- Django: ha epilessia, adatto a contesti tranquilli. Scheda: https://asritalia.com/adotta-ora/django
- Blue: ha bisogno di guida e tempo per adattarsi, no gatti. Scheda: https://asritalia.com/adotta-ora/blue
- Ziggy: indipendente, richiede fiducia e spazio, non abituato ai bambini. Scheda: https://asritalia.com/adotta-ora/ziggy
- Polpetta: ex maltrattato, no bambini o cani maschi. Scheda: https://asritalia.com/adotta-ora/polpetta
- Ron, Draco e Sirius: fratelli equilibrati, vivono in campagna, abituati a persone e bambini. Scheda: https://asritalia.com/adotta-ora/ron-draco-sirius

In base alle risposte dell'utente, suggerisci TUTTI i cani compatibili (anche più di uno se possibile). 
Per ciascun cane suggerito, spiega brevemente perché potrebbe essere adatto e inserisci anche il link alla sua scheda.
Se nessuno dei cani è compatibile, non suggerire alcun cane e rispondi con gentilezza e tono empatico, spiegando che al momento non ci sono cani adatti ma che potremmo ricontattarlo in futuro.
Scrivi tutto in italiano e con tono dolce.
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
