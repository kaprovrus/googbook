document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('vacancies-container');
  const search = document.getElementById('search');
  const cityFilter = document.getElementById('city-filter');
  const refreshBtn = document.getElementById('refresh');
  
  const API_URL = 'https://script.google.com/macros/s/AKfycbx_XO4Uyuh87jyiFN8OYggGlZ09qyOs7-yCWepp8C7DVgVFJ5wk2WdjzYPWXOpahCztPw/exec';
  let vacancies = [];
  let cities = new Set();

  async function loadData() {
    try {
      container.innerHTML = '<div class="loader"><div class="spinner"></div><p>Загрузка...</p></div>';
      
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
      
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Данные не являются массивом');
      
      vacancies = data;
      console.log("Загружено вакансий:", vacancies.length);
      processData();
      renderVacancies();
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      container.innerHTML = `
        <div class="error">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Ошибка загрузки</h3>
          <p>${error.message}</p>
          <button class="retry-btn" onclick="location.reload()">Повторить</button>
        </div>
      `;
    }
  }

  function processData() {
    cities.clear();
    cityFilter.innerHTML = '<option value="">Все города</option>';
    
    vacancies.forEach(v => {
      if (v.Город) cities.add(v.Город.trim());
    });
    
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      cityFilter.appendChild(option);
    });
  }

  function renderVacancies(data = vacancies) {
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="no-data">
          <i class="fas fa-search"></i>
          <p>Нет данных для отображения</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = data.map(v => `
      <div class="vacancy">
        <h2>${v.Должность || 'Без названия'}</h2>
        <div class="meta">
          <span class="company">${v.Компания || 'Не указано'}</span>
          <span class="city">${v.Город || 'Не указан'}</span>
        </div>
        <p>${v.Описание || 'Описание отсутствует'}</p>
        ${v.Зарплата ? `<div class="salary">${v.Зарплата}</div>` : ''}
      </div>
    `).join('');
  }

  search.addEventListener('input', () => {
    const term = search.value.toLowerCase();
    const filtered = vacancies.filter(v => 
      (v.Должность && v.Должность.toLowerCase().includes(term)) ||
      (v.Компания && v.Компания.toLowerCase().includes(term))
    );
    renderVacancies(filtered);
  });

  cityFilter.addEventListener('change', () => {
    const city = cityFilter.value;
    const filtered = city ? vacancies.filter(v => v.Город === city) : vacancies;
    renderVacancies(filtered);
  });

  refreshBtn.addEventListener('click', loadData);

  // Первая загрузка
  loadData();
});
