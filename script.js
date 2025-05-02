document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'https://script.google.com/macros/s/AKfycbx_XO4Uyuh87jyiFN8OYggGlZ09qyOs7-yCWepp8C7DVgVFJ5wk2WdjzYPWXOpahCztPw/exec';
    const WHATSAPP_NUMBER = '7777712591727'; // Замените на ваш номер
    const container = document.getElementById('vacancies-container');
    const searchInput = document.getElementById('search');
    const cityFilter = document.getElementById('city-filter');
    
    let vacancies = [];
    let cities = new Set();

    // Загрузка данных
    async function loadVacancies() {
        try {
            showLoading();
            
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Ошибка загрузки');
            
            const data = await response.json();
            vacancies = data;
            processData();
            renderVacancies();
        } catch (error) {
            showError(error);
        }
    }

    function showLoading() {
        container.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p>Загружаем вакансии...</p>
            </div>
        `;
    }

    function showError(error) {
        container.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>${error.message}</p>
                <button class="retry-btn" onclick="location.reload()">
                    <i class="fas fa-sync-alt"></i> Попробовать снова
                </button>
            </div>
        `;
    }

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

    function renderVacancies(data = vacancies) {
        if (!data || data.length === 0) {
            container.innerHTML = '<p class="no-vacancies">Вакансии не найдены</p>';
            return;
        }
        
        container.innerHTML = data.map(vacancy => `
            <div class="vacancy">
                <h3 class="vacancy-title">${vacancy.Должность || 'Не указана'}</h3>
                <div class="vacancy-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${vacancy.Город || 'Не указан'}</span>
                    <span><i class="fas fa-wallet"></i> ${vacancy.Зарплата || 'Не указана'}</span>
                </div>
                <p class="vacancy-description">${vacancy.Описание || 'Нет описания'}</p>
                <button class="apply-btn" onclick="openWhatsApp('${vacancy.Должность}')">
                    <i class="fab fa-whatsapp"></i> Откликнуться
