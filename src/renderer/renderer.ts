const form = document.getElementById('domain-form');
const input = document.getElementById('domain-input');
const feedback = document.getElementById('feedback');
const currentDomain = document.getElementById('current-domain');

// Gespeicherte Domain laden
window.api.getDomain().then(domain => {
  if (domain) {
    input.value = domain;
    currentDomain.textContent = `Aktuell gespeicherte Domain: ${domain}`;
    currentDomain.hidden = false;
  } else {
    currentDomain.hidden = true;
  }
});

// Domain speichern
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const domain = input.value.trim();

  if (!domain) {
    feedback.textContent = 'Bitte eine gültige Domain eingeben.';
    feedback.classList.add('error');
    return;
  }

  try {
    await window.api.saveDomain(domain);
    feedback.textContent = 'Domain gespeichert! Deck wird geladen …';
    feedback.classList.remove('error');
  } catch (error) {
    console.error('Fehler beim Speichern der Domain:', error);
    feedback.textContent = 'Fehler beim Speichern.';
    feedback.classList.add('error');
  }
});