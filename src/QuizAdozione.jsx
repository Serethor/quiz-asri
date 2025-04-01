import React, { useState } from "react";
const QuizAdozione = () => {
  const [step, setStep] = useState(0);
  const [risposte, setRisposte] = useState({});
  const [risultato, setRisultato] = useState(null);
  const [loading, setLoading] = useState(false);

  const domande = [
    { id: "haCani", testo: "Hai già altri cani?", opzioni: ["Sì", "No"] },
    { id: "sessoCani", testo: "Se sì, sono maschi o femmine?", opzioni: ["Maschi", "Femmine", "Entrambi"] },
    { id: "compatibili", testo: "I tuoi cani vanno d'accordo con altri?", opzioni: ["Sì", "No", "Non so"] },
    { id: "haGatti", testo: "Hai gatti in casa?", opzioni: ["Sì", "No"] },
    { id: "bambini", testo: "Hai bambini piccoli?", opzioni: ["Sì", "No"] },
    { id: "ambiente", testo: "Dove vivi?", opzioni: ["Campagna", "Periferia tranquilla", "Città"] },
    { id: "esperienza", testo: "Hai già esperienza con Aussie o razze simili?", opzioni: ["Sì", "No"] },
    { id: "tipoCane", testo: "Che tipo di cane cerchi?", opzioni: ["Attivo", "Tranquillo", "Non importa"] }
  ];

  const handleRisposta = (valore) => {
    const domandaCorrente = domande[step];
    const nuovaRisposta = { ...risposte, [domandaCorrente.id]: valore };
    setRisposte(nuovaRisposta);

    let prossimoStep = step + 1;
    if (domandaCorrente.id === "haCani" && valore === "No") {
      prossimoStep += 2;
    }

    if (prossimoStep < domande.length) {
      setStep(prossimoStep);
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
        body: JSON.stringify({ risposte: risposteUtente, multipli: true })
      });
      const data = await response.json();
      setRisultato(data.risultato);
    } catch (error) {
      setRisultato("Errore durante l'elaborazione. Riprova più tardi.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-orange-50 p-6 font-[Montserrat]">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 transition-all duration-500">
        {!risultato && !loading && (
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-6">
              {domande[step].testo}
            </h2>
            <div className="space-y-3">
              {domande[step].opzioni.map((opzione) => (
                <button
                  key={opzione}
                  className="w-full py-3 px-4 bg-orange-400 hover:bg-orange-500 text-white text-lg rounded-2xl shadow-md transition-all duration-300 ease-in-out"
                  onClick={() => handleRisposta(opzione)}
                >
                  {opzione}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <p className="text-center text-xl font-semibold text-blue-700">
            Analisi in corso... 🐾
          </p>
        )}

        {risultato && (
          <div className="text-left space-y-4 mt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-orange-500">
              🐾 Risultato del Quiz
            </h2>
            <div
              className="prose prose-lg max-w-none whitespace-pre-line text-gray-800"
              dangerouslySetInnerHTML={{ __html: risultato }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAdozione;
