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
    Queste sono le risposte dell'utente: ${JSON.stringify(risposte)}

    Confrontale con questi cani e suggerisci il più compatibile:
    - Maya: giovane, tranquilla, vive con gatta, non adatta a bambini.
    - Thor: sensibile ai rumori, non ama contesti urbani.
    - Django: ha epilessia, adatto a contesti tranquilli.
    - Blue: ha bisogno di guida e tempo per adattarsi.
    - Ziggy: indipendente, richiede fiducia e spazio.
    - Polpetta: ex maltrattato, no bambini o maschi.
    - Ron/Draco/Sirius: fratelli equilibrati, vivono in campagna.

    Dai una risposta empatica, chiara e in italiano.
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
