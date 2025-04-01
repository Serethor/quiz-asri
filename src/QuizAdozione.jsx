import React, { useState, useEffect } from "react";

const QuizAdozione = () => {
  const [step, setStep] = useState(0);
  const [risposte, setRisposte] = useState({});
  const [risultato, setRisultato] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

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
    <div style={{ fontFamily: "Montserrat, sans-serif", background: "linear-gradient(to bottom, #e0f2ff, #fff7ed)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#fff", borderRadius: "2rem", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: "2rem" }}>
        {!risultato && !loading && (
          <div>
            <h2 style={{ fontSize: "1.8rem", color: "#2E5EAA", marginBottom: "1.5rem", textAlign: "center" }}>{domande[step].testo}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {domande[step].opzioni.map((opzione) => (
                <button
                  key={opzione}
                  onClick={() => handleRisposta(opzione)}
                  style={{
                    padding: "0.9rem 1.2rem",
                    backgroundColor: "#F24333",
                    color: "white",
                    fontSize: "1.1rem",
                    borderRadius: "1rem",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease"
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#c7372a")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#F24333")}
                >
                  {opzione}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#2E5EAA" }}>Analisi in corso... 🐾</p>}

        {risultato && (
          <div style={{ marginTop: "2rem", backgroundColor: "#f1f5ff", padding: "1.5rem", borderRadius: "1.5rem", border: "2px dashed #2E5EAA" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "700", textAlign: "center", marginBottom: "1rem", color: "#F24333" }}>🐶 Risultato del Quiz</h2>
            <div style={{ whiteSpace: "pre-line", fontSize: "1.05rem", lineHeight: "1.6", color: "#333" }} dangerouslySetInnerHTML={{ __html: risultato }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizAdozione;
