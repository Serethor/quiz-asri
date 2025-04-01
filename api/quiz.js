const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { risposte } = req.body;

  const prompt = `
Le risposte dell'utente sono: ${JSON.stringify(risposte)}.

Elenco dei cani disponibili (con link alla loro scheda):
- Maya: femmina, giovane, tranquilla, vive con gatta, non adatta a bambini. Scheda: <a href="https://asritalia.com/adotta-ora/maya" target="_blank">Vai alla scheda di Maya</a>
- Thor: maschio, sensibile ai rumori, non ama contesti urbani. Scheda: <a href="https://asritalia.com/adotta-ora/thor" target="_blank">Vai alla scheda di Thor</a>
- Django: maschio, ha epilessia, adatto a contesti tranquilli. Scheda: <a href="https://asritalia.com/adotta-ora/django" target="_blank">Vai alla scheda di Django</a>
- Blue: maschio, ha bisogno di guida e tempo per adattarsi, no gatti. Scheda: <a href="https://asritalia.com/adotta-ora/blue" target="_blank">Vai alla scheda di Blue</a>
- Ziggy: maschio, indipendente, richiede fiducia e spazio, non abituato ai bambini. Scheda: <a href="https://asritalia.com/adotta-ora/ziggy" target="_blank">Vai alla scheda di Ziggy</a>
- Polpetta: maschio, ex maltrattato, no bambini o cani maschi. Scheda: <a href="https://asritalia.com/adotta-ora/polpetta" target="_blank">Vai alla scheda di Polpetta</a>
- Ron, Draco e Sirius: maschi, fratelli equilibrati, vivono in campagna, abituati a persone e bambini. Scheda: <a href="https://asritalia.com/adotta-ora/ron-draco-sirius" target="_blank">Vai alla scheda di Ron, Draco e Sirius</a>

Valuta la compatibilità tra il cane dell'utente e i cani in elenco anche in base al sesso e alla compatibilità con altri cani.
IMPORTANTE:
- Se l'utente ha un cane maschio che NON va d'accordo con cani maschi, NON proporre cani maschi in nessun caso.
- Se ha una femmina che NON va d'accordo con femmine, NON proporre cani femmine.
- Se l'utente ha detto "Non so", puoi usare cautela ma non escludere automaticamente.

Valuta anche lo stile di vita dell'utente:
- Se fa escursioni o lunghe camminate, non proporre cani con difficoltà motorie o molto pigri.
- Se ha uno stile di vita molto tranquillo, evita cani con altissimo bisogno di attività o stimolazione.
- Se ha un giardino o aree libere, potrebbero essere adatti cani che amano correre.
- Se non fa sport o attività con il cane, non proporre cani che necessitano lavoro mentale o attività costante.

In base alle risposte, suggerisci tutti i cani compatibili (anche più di uno se necessario).
Per ciascun cane spiegane la compatibilità e inserisci il link alla scheda (in formato HTML cliccabile).
Se nessun cane è adatto, non proporre nulla. Rispondi con empatia dicendo che al momento non ci sono cani perfetti per il profilo, ma che potremmo ricontattarlo in futuro.
Scrivi tutto in italiano, in tono affettuoso e chiaro.
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
