const net = require("net");

// Port de la socket pour le serveur
const PORT = 5001;

// Création du serveur
const server = net.createServer((socket) => {
  console.log("--- Client connecté.");

  socket.on("data", (data) => {
    try {
      const request = JSON.parse(data.toString().trim()); // Parse la requete JSON
      console.log("Requête reçue :", request);

      // check si la requête est de type "echo" sinon erreur
      if (request.request === "echo" && request.params && request.params.text) {
        const response = {
          status: "success",
          response: request.params.text, // Reponse avec le texte 
        };
        socket.write(JSON.stringify(response)); // reponse en JSON
      } else {
       
        const errorResponse = { // Reponse en cas de requête mal ecrite
          status: "error",
          message: "Requête invalide ou non prise en charge.",
        };
        socket.write(JSON.stringify(errorResponse));
      }
    } catch (err) {
     
      const errorResponse = { // Gere les erreurs de parsing JSON
        status: "error",
        message: "Erreur lors de l'analyse de la requête JSON.",
      };
      socket.write(JSON.stringify(errorResponse));
    }
  });

  socket.on("end", () => {
    console.log("--- Client déconnecté.");
  });
});

// Demarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
