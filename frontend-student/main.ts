// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
  console.log('Frontend student minimal démarré');

  const el = document.getElementById('app');
  if (el) {
    el.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #2563eb; font-size: 3rem; margin-bottom: 20px;">
          🎓 Portail Étudiant
        </h1>
        <p style="font-size: 1.5rem; color: #64748b; margin-bottom: 30px;">
          Frontend student (Vite) en cours d'exécution
        </p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <p style="color: #475569;">
            ✅ Serveur Vite démarré avec succès<br/>
            🔗 Port: ${window.location.port}<br/>
            🚀 Hot Module Replacement activé
          </p>
        </div>
      </div>
    `;
  }
});

// Exécuter aussi immédiatement au cas où DOMContentLoaded est déjà passé
if (document.readyState === 'loading') {
  // Le DOM n'est pas encore chargé, l'événement ci-dessus se chargera
} else {
  // Le DOM est déjà chargé, exécuter maintenant
  const el = document.getElementById('app');
  if (el) {
    el.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #2563eb; font-size: 3rem; margin-bottom: 20px;">
          🎓 Portail Étudiant
        </h1>
        <p style="font-size: 1.5rem; color: #64748b; margin-bottom: 30px;">
          Frontend student (Vite) en cours d'exécution
        </p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <p style="color: #475569;">
            ✅ Serveur Vite démarré avec succès<br/>
            🔗 Port: ${window.location.port}<br/>
            🚀 Hot Module Replacement activé
          </p>
        </div>
      </div>
    `;
  }
}

