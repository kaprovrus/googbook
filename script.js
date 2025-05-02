const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxq_LYR0KSdPAwmy7UPEgG4Mnr-PabZIJDxt5zguptav_y5mtkrFDWeXmdG9LJa7r5tZQ/exec';
let jobsData = [];
let currentCity = 'all';
let currentLang = 'ru';

async function loadJobs() {
  try {
    const res = await fetch(SHEET_URL);
    jobsData = await res.json();
    renderJobs();
    updateDate();
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  }
}

function renderJobs() {
  const container = document.getElementById('jobList');
  container.innerHTML = '';

  const filtered = currentCity === 'all'
    ? jobsData
    : jobsData.filter(job => job.Город === currentCity);

  filtered.forEach(job => {
    const btn = document.createElement('button');
    btn.className = 'job-button';
    const position = currentLang === 'kk' && job.Должность_Каз ? job.Должность_Каз : job.Должность;
    const description = currentLang === 'kk' && job.Описание_Каз ? job.Описание_Каз : job.Описание;

    btn.innerHTML = `
      <strong>${position}</strong><br>
      ${description}<br>
      <em>${job.Зарплата}</em> — <u>${job.Город}</u>
    `;
    btn.onclick = () => {
      const message = currentLang === 'kk'
        ? `Сәлеметсіз бе! Мен "${position}" қызметіне қызығамын.`
        : `Здравствуйте! Меня интересует вакансия: "${position}".`;
      window.open(`https://wa.me/${job.WhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
    };
    container.appendChild(btn);
  });
}

function filterCity(city) {
  currentCity = city;
  renderJobs();
}

function switchLanguage(lang) {
  currentLang = lang;
  document.getElementById('title').innerText = 
    lang === 'kk' ? 'Біз қызметкерлерді іздейміз' : 'Мы ищем сотрудников';
  document.getElementById('refreshBtn').innerText = 
    lang === 'kk' ? 'Жаңарту' : 'Обновить';
  document.getElementById('allBtn').innerText = 
    lang === 'kk' ? 'Барлығы' : 'Все';
  renderJobs();
}

function updateDate() {
  const dateElem = document.getElementById('date');
  const now = new Date();
  dateElem.innerText = `${now.toLocaleDateString()}`;
}

function refreshJobs() {
  loadJobs();
}

loadJobs();
