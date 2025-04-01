import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  if (req.method === 'POST') {
    const { risposte } = req.body;

    const prompt = `
      Risposte utente: ${JSON.stringify(risposte)}

      Suggerisci il cane più compatibile tra questi:
      - Maya: giovane, tranquilla, vive con gatta, non adatta a bambini.
      - Thor: sensibile ai rumori, non ama contesti urbani.
      - Django: ha epilessia, adatto a contesti tranquilli.
      - Blue: ha bisogno di guida e tempo per adattarsi.
      - Ziggy: indipendente, richiede fiducia e spazio.
      - Polpetta: ex maltrattato, no bambini o maschi.
      - Ron/Draco/Sirius: fratelli equilibrati, vivono in campagna.

      Se nessuno è adatto, suggerisci di lasciare un contatto.
    `;

    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const risultato = completion.data.choices[0].message.content;
      res.status(200).json({ risultato });
    } catch (error) {
      res.status(500).json({ risultato: 'Errore AI.' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}