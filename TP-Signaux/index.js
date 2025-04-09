// Variable pour suivre l'état du processus
let canExit = true;

// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
  if (canExit) {
    console.log(`Signal ${signal} reçu.`);
    console.log("Nettoyage en cours...");

    // Attendre 5 secondes avant d'arrêter le processus
    setTimeout(() => {
      console.log("Arrêt du processus.");
      process.exit(0);
    }, 5000);
  } else {
    console.log(`Signal ${signal} reçu, mais l'arrêt est impossible pour le moment.`);
  }
}

// Écoute du signal SIGINT
process.on("SIGINT", () => handleSignal("SIGINT"));

// Simulation d'une application qui reste active
console.log("Application en cours d'exécution.");
console.log("Appuyez sur CTRL+C pour envoyer un signal.");

// Exécute la fonction toutes les 5 secondes pour alterner l'état
setInterval(() => {
  canExit = !canExit; // Alterner entre true et false
  console.log(
    canExit
      ? "Le processus peut maintenant être arrêté."
      : "Le processus est en phase critique, l'arrêt est impossible."
  );
}, 5000);

// Exécute un message toutes les 5 secondes pour indiquer que le processus est actif
setInterval(() => {
  console.log("Le processus est toujours actif...");
}, 5000);
