const contentSections = document.querySelectorAll('[data-content-page]');

async function loadSection(section) {
  if (section.dataset.loaded === 'true') return;

  const page = await fetch(section.dataset.contentPage);
  if (!page.ok) throw new Error(`${page.status} ${page.statusText}`);

  const documentText = await page.text();
  const parsedPage = new DOMParser().parseFromString(documentText, 'text/html');
  const sourceMain = parsedPage.querySelector('main');
  if (!sourceMain) throw new Error('No main content found');
  const sourceContent = section.dataset.contentSelector
    ? sourceMain.querySelector(section.dataset.contentSelector)
    : sourceMain;
  if (!sourceContent) throw new Error('Requested content was not found');

  section.innerHTML = sourceContent.innerHTML;
  section.dataset.loaded = 'true';
}

function showLoadError(section, error) {
  section.innerHTML = `<div class="mx-auto max-w-xl text-center"><p class="text-gold">This section could not be loaded.</p><p class="mt-2 text-base text-soft">Please refresh the page or try again shortly.</p></div>`;
  console.error(`Unable to load ${section.dataset.contentPage}:`, error);
}

async function loadHomepageSections() {
  await Promise.all([...contentSections].map(async (section) => {
    try {
      await loadSection(section);
    } catch (error) {
      showLoadError(section, error);
    }
  }));

  const countdown = ['d', 'h', 'm', 's'].map((id) => document.getElementById(id));
  if (countdown.every(Boolean)) {
    const weddingDate = new Date(2026, 11, 12).getTime();
    const updateCountdown = () => {
      const remaining = Math.max(0, weddingDate - Date.now());
      countdown[0].textContent = Math.floor(remaining / 864e5);
      countdown[1].textContent = Math.floor(remaining / 36e5) % 24;
      countdown[2].textContent = Math.floor(remaining / 6e4) % 60;
      countdown[3].textContent = Math.floor(remaining / 1e3) % 60;
    };
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
}

loadHomepageSections();