function normaliseDomain(domain: string): string {
    return domain.trim();
}

async function init() {
    const form = document.getElementById('domain-form') as HTMLFormElement | null;
    const domainInput = document.getElementById('domain-input') as HTMLInputElement | null;
    const currentDomainElement = document.getElementById('current-domain') as HTMLParagraphElement | null;
    const feedbackElement = document.getElementById('feedback') as HTMLParagraphElement | null;

    if (!form || !domainInput) {
        return;
    }

    const existingDomain = await window.api.getDomain();
    if (existingDomain) {
        const normalised = normaliseDomain(existingDomain);
        domainInput.value = normalised;
        if (currentDomainElement) {
            currentDomainElement.textContent = `Aktuell verwendet: ${normalised}`;
            currentDomainElement.hidden = false;
        }
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const rawValue = domainInput.value.trim();
        if (!rawValue) {
            if (feedbackElement) {
                feedbackElement.textContent = 'Bitte gib eine gültige Domain ein.';
                feedbackElement.classList.remove('success');
                feedbackElement.classList.add('error');
            }
            domainInput.focus();
            return;
        }

        try {
            await window.api.saveDomain(rawValue);
            if (feedbackElement) {
                feedbackElement.textContent = 'Domain gespeichert. Das Hauptfenster lädt die Deck-App neu.';
                feedbackElement.classList.remove('error');
                feedbackElement.classList.add('success');
            }
        } catch (error) {
            if (feedbackElement) {
                feedbackElement.textContent = 'Die Domain konnte nicht gespeichert werden.';
                feedbackElement.classList.remove('success');
                feedbackElement.classList.add('error');
            }
            console.error('Failed to save domain', error);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    void init();
});