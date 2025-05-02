document.addEventListener('DOMContentLoaded', () => {
  const vacanciesContainer = document.getElementById('vacancies');
  const searchInput = document.getElementById('search');
  const cityFilter = document.getElementById('city-filter');
  
  // Замените на ваш URL API из Google Apps Script
  const API_URL = 'https://script.google.com/macros/s/AKfycbzhAX4GPquWSxKoinrlb-OIvyj5H47NdYUn9hnEzKl4e1lTdLgRiZE_zEr5qA5aq9AC/exec';
  
  let vacancies = [];
  let cities = new Set();
  
  // Загрузка данных
  async function loadData() {
    try {
      const response = await fetch(API_URL);
      vacancies = await response.json();
      processData();
      renderVacancies();
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      vacanciesContainer.innerHTML = '<p>Не удалось загрузить вакансии</p>';
    }
  }
  
  // Обработка данных
  function processData() {
    cities.clear();
    cityFilter.innerHTML = '<option value="">Все города</option>';
    
    vacancies.forEach(v => {
      if (v.Город) cities.add(v.Город);
    });
    
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      cityFilter.appendChild(option);
    });
  }
  
  // Отображение вакансий
  function renderVacancies(filteredVacancies) {
    const data = filteredVacancies || vacancies;
    
    if (data.length === 0) {
      vacanciesContainer.innerHTML = '<p>Вакансии не найдены</p>';
      return;
    }
    
    vacanciesContainer.innerHTML = '';
    
    data.forEach(vacancy => {
      const vacancyEl = document.createElement('div');
      vacancyEl.className = 'vacancy';
      vacancyEl.innerHTML = `
        <h2>${vacancy.Должность}</h2>
        <div class="meta">
          <span>${vacancy.Компания}</span> •
          <span>${vacancy.Город}</span> •
          <span>${vacancy.Дата}</span>
        </div>
        <p>${vacancy.Описание}</p>
        <div class="salary">${vacancy.Зарплата || 'Не указана'}</div>
      `;
      vacanciesContainer.appendChild(vacancyEl);
    });
  }
  
  // Фильтрация
  function filterVacancies() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCity = cityFilter.value;
    
    const filtered = vacancies.filter(v => {
      const matchesSearch = 
        v.Должность.toLowerCase().includes(searchTerm) ||
        v.Компания.toLowerCase().includes(searchTerm) ||
        (v.Описание && v.Описание.toLowerCase().includes(searchTerm));
      
      const matchesCity = !selectedCity || v.Город === selectedCity;
      
      return matchesSearch && matchesCity;
    });
    
    renderVacancies(filtered);
  }
  
  // Слушатели событий
  searchInput.addEventListener('input', filterVacancies);
  cityFilter.addEventListener('change', filterVacancies);
  
  // Инициализация
  loadData();
});