(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobile navigation
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');
  menuToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '×' : '☰';
  });
  $$('.nav-links a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuToggle) menuToggle.textContent = '☰';
  }));

  // Lightweight scroll reveals and active section indicator
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add('is-visible'));

  const progress = $('#topProgress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }
  $('#year').textContent = new Date().getFullYear();

  // Contact form uses mailto; no data is stored on the website.
  $('#contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = $('#senderName').value.trim();
    const email = $('#senderEmail').value.trim();
    const message = $('#senderMessage').value.trim();
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Hi Poornima,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`);
    $('#formNote').textContent = 'Opening your email application…';
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  });

  // Local portfolio guide: curated responses only; unknown details are not invented.
  const assistantLauncher = $('#assistantLauncher');
  const chatPanel = $('#chatPanel');
  const chatClose = $('#chatClose');
  const chatForm = $('#chatForm');
  const chatInput = $('#chatInput');
  const chatMessages = $('#chatMessages');
  const suggestions = $('#suggestions');

  function setChatOpen(open) {
    chatPanel.classList.toggle('open', open);
    chatPanel.setAttribute('aria-hidden', String(!open));
    assistantLauncher.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => chatInput?.focus(), 180);
  }
  assistantLauncher?.addEventListener('click', () => setChatOpen(!chatPanel.classList.contains('open')));
  chatClose?.addEventListener('click', () => setChatOpen(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setChatOpen(false); });

  const normalize = value => value.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();

  const answerRules = [
    { keys: ['hello','hi','hey','hii','namaste','good morning','good evening','how are you'], answer: "Hi! 👋 Welcome to Poornima's portfolio. I can help with her education, interests, skills, career direction and contact options. What would you like to know?" },
    { keys: ['who is poornima','about poornima','tell me about poornima','about her','introduce','yourself','who are you','poornima jat'], answer: "Poornima Jat is a Bachelor of Pharmacy (B.Pharm) student at Savitribai Phule Pune University. Her interests include pharmacovigilance, drug safety, adverse drug reaction (ADR) monitoring and clinical research. She is focused on learning and growing in pharmaceutical sciences." },
    { keys: ['education','college','university','degree','qualification','study','studying','bpharm','b pharm','pharmacy student'], answer: "Poornima is pursuing a Bachelor of Pharmacy (B.Pharm) at Savitribai Phule Pune University (SPPU), Pune, Maharashtra. Her course dates are listed as July 2023 to June 2027 (expected) in the profile information." },
    { keys: ['interest','interested','passion','field','career goal','career path','future'], answer: "Her stated areas of interest are pharmacovigilance, drug safety, adverse drug reaction (ADR) monitoring and clinical research. These are learning and career interests, not a claim of professional licensure." },
    { keys: ['pharmacovigilance','drug safety','medicine safety','safe medicine','pharma'], answer: "Poornima is interested in pharmacovigilance and drug safety: areas concerned with monitoring medicine safety and supporting safer patient outcomes. Her portfolio describes these as interests she is learning about." },
    { keys: ['adr','adverse drug','reaction monitoring'], answer: "ADR means adverse drug reaction. Poornima lists ADR monitoring as one of her interests, alongside pharmacovigilance, drug safety and clinical research." },
    { keys: ['clinical research','research','clinical trial'], answer: "Clinical research is one of Poornima's stated interests. She is keen to learn more about research concepts and evidence-led healthcare. This portfolio doesn't claim specific clinical research employment or certifications." },
    { keys: ['skill','technical','strength','expertise','know'], answer: "The profile highlights pharmacy-related focus areas: pharmacovigilance, drug safety, ADR monitoring and clinical research. It also notes a learning mindset, communication, analytical thinking and teamwork as areas for continued professional growth. I don't have a verified list of completed technical certifications to claim." },
    { keys: ['project','work','experience','internship','job','employment'], answer: "This portfolio currently focuses on Poornima's pharmacy education and career interests. No verified project, internship or employment details have been provided for me to describe accurately." },
    { keys: ['certification','certificate','course','award','achievement'], answer: "I don't have verified certification or award details for Poornima yet, so I won't invent any. You can update this portfolio when those details are available." },
    { keys: ['contact','email','phone','number','call','whatsapp','linkedin','connect','message'], answer: "You can connect through Poornima's LinkedIn profile: https://www.linkedin.com/in/poornima-jat-a45b00437/. Her phone number is intentionally hidden on this public portfolio. You can also use the contact form to prepare an email." },
    { keys: ['location','where','city','pune','maharashtra'], answer: "The profile lists Pimpri-Chinchwad, Maharashtra, India, and her university is Savitribai Phule Pune University in Pune." },
    { keys: ['resume','cv','download'], answer: "A verified resume PDF has not been added to this starter portfolio yet. Add your approved resume PDF to the website folder before enabling a resume download link." },
    { keys: ['language','hindi','english'], answer: "Language proficiency details haven't been provided for this portfolio yet, so I can't confirm which languages Poornima lists professionally." },
    { keys: ['thank','thanks','shukriya','dhanyawad'], answer: "You're welcome! 😊 If you'd like, ask me about Poornima's education, career interests or contact details." },
    { keys: ['help','what can you do','options','ask'], answer: "You can ask me about Poornima's background, B.Pharm education, SPPU, pharmacovigilance, ADR monitoring, clinical research, listed skills or LinkedIn contact. If a detail isn't confirmed, I'll say so rather than guessing." }
  ];

  function getAnswer(question) {
    const q = normalize(question);
    if (!q) return "Please type a question and I'll do my best to help.";
    let best = null, bestScore = 0;
    for (const rule of answerRules) {
      let score = 0;
      for (const key of rule.keys) {
        const k = normalize(key);
        if (q === k) score += 5;
        else if (q.includes(k)) score += k.includes(' ') ? 3 : 2;
        else {
          const tokens = k.split(' ').filter(t => t.length > 3);
          if (tokens.length && tokens.every(token => q.includes(token))) score += 1;
        }
      }
      if (score > bestScore) { bestScore = score; best = rule; }
    }
    if (best && bestScore > 0) return best.answer;
    return "I couldn't confidently match that question to the information published here. Try asking in another way, such as “What is Poornima studying?”, “What are her career interests?” or “How can I contact her?” I won't make up details that aren't confirmed.";
  }

  function addMessage(text, who) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${who === 'user' ? 'user-message' : 'bot-message'}`;
    const p = document.createElement('p');
    p.textContent = text;
    wrapper.appendChild(p);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function sendQuestion(question) {
    const text = question.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatInput.value = '';
    if (suggestions) suggestions.style.display = 'none';
    const response = getAnswer(text);
    window.setTimeout(() => addMessage(response, 'bot'), 220);
  }
  chatForm?.addEventListener('submit', e => { e.preventDefault(); sendQuestion(chatInput.value); });
  suggestions?.addEventListener('click', e => {
    const button = e.target.closest('button[data-question]');
    if (button) sendQuestion(button.dataset.question);
  });
})(); 
