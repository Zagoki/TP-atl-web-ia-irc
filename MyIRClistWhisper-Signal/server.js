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

// Envoyer un message privé
const whisper = (sender, recipientPseudo, message) => {
  const recipient = clients.find((client) => client.pseudo === recipientPseudo);
  if (recipient) {
    recipient.socket.write(`[Whisper][${sender}] ${message}\n`);
  } else {
    sender.write(`Utilisateur ${recipientPseudo} introuvable.\n`);
  }
};

// Création du serveur TCP
const server = net.createServer((socket) => {
  socket.write("Bienvenue sur le serv IRC du roi Mattheo sans accent sur le e, Quel est votre pseudo ?   ");

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
          socket.write("Le pseudo doit contenir au moins 2 lettre, deconne pas :  ");
          return;
        }

        if (clients.some((client) => client.pseudo === message)) {
          socket.write("Ce pseudo est déjà pris espece de c :    ");
          return;
        }

        pseudo = message;
        clients.push({ socket, pseudo });
        console.log(`${pseudo} vient de se connecter.`);
        broadcast(`-- ${pseudo} a rejoint le chat --\n`, socket);
        socket.write(`Bienvenue ${pseudo} ! Vous pouvez maintenant discuter, rire blablabla bref.`);
      } else if (message === "/list") {
        // Commande /list : afficher la liste des pseudos
        const pseudoList = clients.map((client, index) => `# ${index + 1}. ${client.pseudo}`).join("\n");
        socket.write(`Utilisateurs connectés :\n${pseudoList}\n`);
      } else if (message.startsWith("/whisper ")) {
        // Commande /whisper : envoyer un message privé
        const args = message.match(/^\/whisper (\S+) "(.+)"$/);
        if (args) {
          const [, recipientPseudo, whisperMessage] = args;
          whisper(socket, recipientPseudo, whisperMessage);
        } else {
          socket.write('Format incorrect. Utilisation : /whisper <pseudo> "<message>"\n');
        }
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



//  [Whisper][Expéditeur] <Message>
//  genre  [Whisper][Amélie] Comment ça va ?
//
///whisper Lennon "Hello!"
//
//et si le user existe pas
//Utilisateur Lennon introuvable.
