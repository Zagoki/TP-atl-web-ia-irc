const net = require("net");

const PORT = 6667;

// Connexion au serveur
const client = net.createConnection(PORT, "localhost", () => {
  console.log("--- Connecté au serveur.");

  // requete JSON 
  const request = {
    request: "echo",
    params: {
      text: "HEHHOOOOO",
    },
  };

  client.write(JSON.stringify(request));
});

client.on("data", (data) => {
  try {
    const response = JSON.parse(data.toString().trim());
    console.log("Réponse du serv :", response);
  } catch (err) {
    console.error("Erreur lors du traitement de la réponse :", err.message);
  } finally {
    client.end(); 
  }
});

client.on("end", () => {
  console.log("--- Déconnecté du serveur.");
});