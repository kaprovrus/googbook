document.addEventListener('DOMContentLoaded', function() {
  // Константы
  const API_URL = 'https://script.google.com/macros/s/AKfycbx_XO4Uyuh87jyiFN8OYggGlZ09qyOs7-yCWepp8C7DVgVFJ5wk2WdjzYPWXOpahCztPw/exec';
  const container = document.getElementById('vacancies-container');
  const searchInput = document.getElementById('search');
  const cityFilter = document.getElementById('city-filter');
  const refreshBtn = document.getElementById('refresh');
  
  // Основные переменные
  let allVacancies = [];
  let filteredVacancies = [];

  // Инициализация при загрузке
  init();

  // Основные функции
  async function init() {
    await loadVacancies();
    setupEventListeners();
  }

  async function loadVacancies() {
    showLoadingState();
    
    try {
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message);
      }
      
      console.log('Успешно загружено вакансий:', data.count);
      
      allVacancies = data.data || [];
      filteredVacancies = [...allVacancies];
      
      updateCityFilter();
      renderVacancies();
      
    } catch (error) {
      showErrorState(error);
      console.error('Ошибка загрузки:', error);
    }
  }

  function renderVacancies() {
    if (filteredVacancies.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>По вашему запросу ничего не найдено</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = filteredVacancies.map(vacancy => `
      <div class="vacancy">
        <h3>${vacancy.Должность || 'Без названия'}</h3>
        <div class="meta">
          <span class="company">${vacancy.Компания || 'Не указано'}</span>
          <span class="separator">•</span>
          <span class="city">${vacancy.Город || 'Не указан'}</span>
        </div>
        <p class="description">${vacancy.Описание || 'Нет описания'}</p>
        ${vacancy.Зарплата ? `<div class="salary">${vacancy.Зарплата}</div>` : ''}
      </div>
    `).join('');
  }

  function updateCityFilter() {
    const cities = [...new Set(allVacancies
      .map(v => v.Город)
      .filter(city => city)
    )];
    
    cityFilter.innerHTML = `
      <option value="">Все города</option>
      ${cities.map(city => `<option value="${city}">${city}</option>`).join('')}
    `;
  }

  function filterVacancies() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCity = cityFilter.value;
    
    filteredVacancies = allVacancies.filter(vacancy => {
      const matchesSearch = 
        (vacancy.Должность && vacancy.Должность.toLowerCase().includes(searchTerm)) ||
        (vacancy.Компания && vacancy.Компания.toLowerCase().includes(searchTerm)) ||
        (vacancy.Описание && vacancy.Описание.toLowerCase().includes(searchTerm));
      
      const matchesCity = !selectedCity || vacancy.Город === selectedCity;
      
      return matchesSearch && matchesCity;
    });
    
    renderVacancies();
  }

  function showLoadingState() {
    container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Загрузка вакансий...</p>
      </div>
    `;
  }

  function showErrorState(error) {
    container.innerHTML = `
      <div class="error">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Ошибка загрузки</h3>
        <p>${error.message}</p>
        <button class="retry-btn" onclick="window.location.reload()">Попробовать снова</button>
      </div>
    `;
  }

  function setupEventListeners() {
    searchInput.addEventListener('input', filterVacancies);
    cityFilter.addEventListener('change', filterVacancies);
    refreshBtn.addEventListener('click', loadVacancies);
  }
});
