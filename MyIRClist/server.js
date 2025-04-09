const net = require("net");

const PORT = 6667;
const clients = [];

// Diffuser un message à tous les clients sauf l'expéditeur
const broadcast = (message, sender) => {
  clients.forEach(({ socket }) => {
    if (socket !== sender) {
      socket.write(message);
    }
  });
};

// Création du serveur TCP
const server = net.createServer((socket) => {
  socket.write("Bienvenue sur le serveur IRC ! Quel est votre pseudo ?\n");

  let pseudo = null; // Pseudo de l'utilisateur
  let buffer = "";   // Buffer pour stocker les messages temporaires

  // Fonction pour gérer les données reçues
  socket.on("data", (data) => {
    buffer += data.toString(); // Ajouter les données au buffer

    // Vérifier si l'utilisateur a validé avec "Entrée"
    if (buffer.includes("\n")) {
      const message = buffer.trim(); // Supprimer les espaces et retours à la ligne
      buffer = ""; // Réinitialiser le buffer

      if (!pseudo) {
        // Première interaction : définir le pseudo
        if (!/^[a-zA-Z0-9]{2,}$/.test(message)) {
          socket.write("Le pseudo doit contenir au moins 2 caractères alphanumériques. Réessayez : ");
          return;
        }

        pseudo = message;
        clients.push({ socket, pseudo });
        console.log(`${pseudo} vient de se connecter.`);
        broadcast(`-- ${pseudo} a rejoint le chat --\n`, socket);
        socket.write(`Bienvenue ${pseudo} ! Vous pouvez maintenant discuter.\n`);
      } else if (message === "/list") {
        // Commande /list : afficher la liste des pseudos
        const pseudoList = clients.map((client) => client.pseudo).join(", ");
        socket.write(`Utilisateurs connectés : ${pseudoList}\n`);
      } else {
        // Diffuser le message aux autres clients
        console.log(`${pseudo}: ${message}`);
        broadcast(`${pseudo}: ${message}\n`, socket);
      }
    }
  });

  // Gestion de la déconnexion
  socket.on("end", () => {
    console.log(`${pseudo} s'est déconnecté.`);
    clients.splice(clients.findIndex((client) => client.socket === socket), 1);
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
