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

function initializeRsvp(section) {
  const form = section.querySelector('#rsvpForm');
  if (!form) return;

  const rsvpUrl = 'https://script.google.com/macros/s/AKfycbyHJfKbNyNmb_sVnho5RLIcq5fc1h7maSLXuMo4fDw2YRg2Hyb2xhi5vfUwAeSC9o-x3Q/exec';
  const message = section.querySelector('#rsvpMessage');
  const submitButton = section.querySelector('#rsvpSubmit');
  const attendanceOptions = section.querySelector('#attendanceOptions');
  let invitationFound = false;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    if (!invitationFound) {
      message.textContent = 'Checking your invitation...';
      message.classList.remove('hidden');
      submitButton.disabled = true;

      const callbackName = `rsvpSearch${Date.now()}`;
      const searchScript = document.createElement('script');
      const searchParams = new URLSearchParams({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        callback: callbackName,
      });

      window[callbackName] = (result) => {
        delete window[callbackName];
        searchScript.remove();
        submitButton.disabled = false;

        if (result.alreadyResponded) {
          message.textContent = 'This guest has already submitted an RSVP.';
          return;
        }

        if (!result.found) {
          message.textContent = 'Name not found. Please check the spelling and try again.';
          return;
        }

        invitationFound = true;
        attendanceOptions.classList.remove('hidden');
        attendanceOptions.querySelectorAll('input').forEach((input) => {
          input.required = true;
        });
        message.textContent = 'Invitation found. Please choose your attendance.';
        submitButton.textContent = 'Submit RSVP';
      };

      searchScript.src = `${rsvpUrl}?${searchParams.toString()}`;
      document.body.appendChild(searchScript);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'RSVP Submitted';
    fetch(rsvpUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams(formData),
    });
    message.textContent = 'Thank you! Your RSVP has been submitted.';
    message.classList.remove('hidden');
    form.reset();
    invitationFound = false;
    attendanceOptions.classList.add('hidden');
    attendanceOptions.querySelectorAll('input').forEach((input) => {
      input.required = false;
    });
    submitButton.disabled = false;
    submitButton.textContent = 'Find My Invitation';
  });
}

async function loadHomepageSections() {
  await Promise.all([...contentSections].map(async (section) => {
    try {
      await loadSection(section);
    } catch (error) {
      showLoadError(section, error);
    }
  }));

  const rsvpSection = [...contentSections].find((section) => section.dataset.contentPage === 'rsvp.html');
  if (rsvpSection) initializeRsvp(rsvpSection);

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