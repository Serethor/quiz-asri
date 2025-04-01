import React, { useState } from "react";

const QuizAdozione = () => {
  const [step, setStep] = useState(0);
  const [risposte, setRisposte] = useState({});
  const [risultato, setRisultato] = useState(null);
  const [loading, setLoading] = useState(false);

  const domande = [
    { id: "haCani", testo: "Hai già altri cani?", opzioni: ["Sì", "No"] },
    { id: "sessoCani", testo: "Se sì, sono maschi o femmine?", opzioni: ["Maschi", "Femmine", "Entrambi", "Non ho cani"] },
    { id: "compatibili", testo: "I tuoi cani vanno d'accordo con altri?", opzioni: ["Sì", "No", "Non so"] },
    { id: "haGatti", testo: "Hai gatti in casa?", opzioni: ["Sì", "No"] },
    { id: "bambini", testo: "Hai bambini piccoli?", opzioni: ["Sì", "No"] },
    { id: "ambiente", testo: "Dove vivi?", opzioni: ["Campagna", "Periferia tranquilla", "Città"] },
    { id: "esperienza", testo: "Hai già esperienza con Aussie o razze simili?", opzioni: ["Sì", "No"] },
    { id: "tipoCane", testo: "Che tipo di cane cerchi?", opzioni: ["Attivo", "Tranquillo", "Non importa"] }
  ];

  const handleRisposta = (valore) => {
    const nuovaRisposta = { ...risposte, [domande[step].id]: valore };
    setRisposte(nuovaRisposta);
    if (step + 1 < domande.length) {
      setStep(step + 1);
    } else {
      inviaRisposte(nuovaRisposta);
    }
  };

  const inviaRisposte = async (risposteUtente) => {
    setLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ risposte: risposteUtente })
      });
      const data = await response.json();
      setRisultato(data.risultato);
    } catch (error) {
      setRisultato("Errore durante l'elaborazione. Riprova più tardi.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow">
      {!risultato && !loading && (
        <div>
          <h2 className="text-xl font-bold mb-4">{domande[step].testo}</h2>
          <div className="space-y-2">
            {domande[step].opzioni.map((opzione) => (
              <button
                key={opzione}
                className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleRisposta(opzione)}
              >
                {opzione}
              </button>
            ))}
          </div>
        </div>
      )}
      {loading && <p className="text-center">Analisi in corso... 🐾</p>}
      {risultato && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Risultato del Quiz</h2>
          <p>{risultato}</p>
        </div>
      )}
    </div>
  );
};

export default QuizAdozione;