const net = require("net");

const PORT = 6667;
const clients = [];

// Création du serveur TCP
const server = net.createServer((socket) => {
  socket.write("Bienvenue sur le serveur IRC CRI BTS CERFA SNCF BNP Paris bas ! Quel est votre pseudo petit homme ?\n");

  let pseudo = null; // Pseudo de l'utilisateur
  let buffer = "";   // Buffer pour stocker les messages temporaires

  // Diffuser un message à tous les clients sauf l'expéditeur
  const broadcast = (message, sender) => {
    clients.forEach((client) => {
      if (client !== sender) {
        client.write(message);
      }
    });
  };

  // Fonction pour gérer les données reçues
  socket.on("data", (data) => {
    buffer += data.toString(); // Ajouter les données au buffer

    // Vérifier si l'utilisateur a validé avec "Entrée"
    if (buffer.includes("\n")) {
      const message = buffer.trim(); // Supprimer les espaces et retours à la ligne
      buffer = ""; // Réinitialiser le buffer

      if (!pseudo) {
        // Première interaction : définir le pseudo
        pseudo = message;
        clients.push(socket);
        console.log(`${pseudo} vient de se connecter.`);
        broadcast(`-- ${pseudo} a rejoint le chat miaou --\n\r`, socket);
        socket.write(`Bienvenue ${pseudo} ! Vous pouvez maintenant discuter et rire et oh on s'en fout.\n\r`);
      } else {
        // Diffuser le message aux autres clients
        console.log(`${pseudo}: ${message}`);
        broadcast(`${pseudo}: ${message}\n\r`, socket);
      }
    }
  });

  // Gestion de la déconnexion
  socket.on("end", () => {
    console.log(`${pseudo} s'est déconnecté.`);
    clients.splice(clients.indexOf(socket), 1);
    broadcast(`-- ${pseudo} a quitté le chat --\n`, socket);
  });

  // Gestion des erreurs
  socket.on("error", (err) => {
    console.error(`Erreur avec ${pseudo}: ${err.message}`);
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur IRC en écoute sur le port ${PORT}`);
});