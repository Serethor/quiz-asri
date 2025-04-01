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
- Maya: femmina, giovane, tranquilla, vive con gatta, non adatta a bambini. Compatibile con maschi. Scheda: <a href="https://asritalia.com/adotta-ora/maya" target="_blank">Vai alla scheda di Maya</a>
- Thor: maschio, sensibile ai rumori, non ama contesti urbani. Compatibile con femmine. Scheda: <a href="https://asritalia.com/adotta-ora/thor" target="_blank">Vai alla scheda di Thor</a>
- Django: maschio, ha epilessia, adatto a contesti tranquilli. Compatibile con femmine e gatti. Scheda: <a href="https://asritalia.com/adotta-ora/django" target="_blank">Vai alla scheda di Django</a>
- Blue: maschio, ha bisogno di guida e tempo per adattarsi, no gatti. Compatibile con femmine equilibrate. Scheda: <a href="https://asritalia.com/adotta-ora/blue" target="_blank">Vai alla scheda di Blue</a>
- Ziggy: maschio, indipendente, richiede fiducia e spazio, non abituato ai bambini. Compatibile con maschi e femmine. Scheda: <a href="https://asritalia.com/adotta-ora/ziggy" target="_blank">Vai alla scheda di Ziggy</a>
- Polpetta: maschio, ex maltrattato, no bambini o cani maschi. Compatibile solo con femmine equilibrate. Scheda: <a href="https://asritalia.com/adotta-ora/polpetta" target="_blank">Vai alla scheda di Polpetta</a>
- Ron, Draco e Sirius: maschi, fratelli equilibrati, vivono in campagna, abituati a persone e bambini. Compatibili con altri cani. Scheda: <a href="https://asritalia.com/adotta-ora/ron-draco-sirius" target="_blank">Vai alla scheda di Ron, Draco e Sirius</a>

🚨 REGOLA PRIORITARIA E VINCOLANTE:
Prima di qualsiasi valutazione, DEVI analizzare il sesso del cane già presente nella famiglia dell'utente e la sua compatibilità:

1. Se il cane dell'utente è MASCHIO e NON compatibile con altri MASCHI, escludi TUTTI i cani MASCHI.
2. Se è FEMMINA e NON compatibile con altre FEMMINE, escludi TUTTE le FEMMINE.
3. Se l'utente ha detto che il suo cane NON è compatibile con cani del sesso opposto, escludi quelli del sesso opposto.

DOPO questa analisi, valuta anche se i cani del rescue sono compatibili con maschi, femmine o entrambi.
Un cane non può essere suggerito se NON è compatibile con il sesso del cane dell'utente.

SOLO se entrambe le compatibilità (utente verso rescue e rescue verso utente) sono OK, allora puoi passare alla valutazione dello stile di vita e altre preferenze.

NON cercare eccezioni. Se un cane è incompatibile secondo il sesso o la sua compatibilità, non deve essere suggerito.

🔎 SOLO dopo aver filtrato correttamente i cani in base al sesso e compatibilità, puoi valutare:
- stile di vita (attivo, sedentario, sportivo, ecc.)
- ambiente (giardino, città, campagna...)
- desideri dell’utente (compagnia, escursioni, sport...)

Suggerisci solo i cani realmente compatibili (anche più di uno se necessario).
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
