document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'https://script.google.com/macros/s/AKfycbw1HV2piKoHO77blSfvkY3cuHtf0Qppj1VkoPBH5LYNtOPlx-t2DU0HSjYyhAv7tslvRQ/exec';
    const WHATSAPP_NUMBER = '77712591727'; // Замените на ваш номер
    const container = document.getElementById('vacancies-container');
    const searchInput = document.getElementById('search');
    const searchInputKZ = document.getElementById('search-kz');
    const cityFilter = document.getElementById('city-filter');
    const langSwitcher = document.getElementById('language-switcher');
    
    let vacancies = [];
    let cities = new Set();
    let currentLang = 'ru';

    // Инициализация
    loadVacancies();
    setupEventListeners();

    // Загрузка данных
    async function loadVacancies() {
        try {
            showLoading();
            
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(getTranslation('load_error'));
            
            const data = await response.json();
            vacancies = data;
            processData();
            renderVacancies();
            updateTime();
        } catch (error) {
            showError(error);
        }
    }

    function showLoading() {
        container.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p data-lang="ru">Загружаем вакансии...</p>
                <p data-lang="kz">Жұмыс орындары жүктелуде...</p>
            </div>
        `;
        updateLanguageElements();
    }

    function showError(error) {
        container.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>${getTranslation('error_title')}</h3>
                <p>${error.message}</p>
                <button class="retry-btn" onclick="location.reload()">
                    <i class="fas fa-sync-alt"></i> ${getTranslation('try_again')}
                </button>
            </div>
        `;
    }

    function processData() {
        cities.clear();
        
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = getTranslation('all_cities');
        allOption.setAttribute('data-lang', 'both');
        cityFilter.innerHTML = '';
        cityFilter.appendChild(allOption);
        
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
            container.innerHTML = `
                <p class="no-vacancies" data-lang="ru">Вакансии не найдены</p>
                <p class="no-vacancies" data-lang="kz">Жұмыс орындары табылмады</p>
            `;
            updateLanguageElements();
            return;
        }
        
        container.innerHTML = data.map(vacancy => `
            <div class="vacancy">
                <h3 class="vacancy-title">${vacancy.Должность || getTranslation('no_position')}</h3>
                <div class="vacancy-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${vacancy.Город || getTranslation('no_city')}</span>
                    <span><i class="fas fa-wallet"></i> ${vacancy.Зарплата || getTranslation('no_salary')}</span>
                </div>
                <p class="vacancy-description">${vacancy.Описание || getTranslation('no_description')}</p>
                <button class="apply-btn" onclick="openWhatsApp('${vacancy.Должность}')">
                    <i class="fab fa-whatsapp"></i> ${getTranslation('apply')}
                </button>
            </div>
        `).join('');
    }

    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'kk-KZ');
        document.getElementById('update-time').textContent = timeString;
        document.getElementById('update-time-kz').textContent = timeString;
    }

    function setupEventListeners() {
        searchInput.addEventListener('input', filterVacancies);
        searchInputKZ.addEventListener('input', filterVacancies);
        cityFilter.addEventListener('change', filterVacancies);
        langSwitcher.addEventListener('click', toggleLanguage);
    }

    function filterVacancies() {
        const searchTerm = (currentLang === 'ru' ? searchInput.value : searchInputKZ.value).toLowerCase();
        const selectedCity = cityFilter.value;
        
        const filtered = vacancies.filter(vacancy => {
            const matchesSearch = 
                (vacancy.Должность && vacancy.Должность.toLowerCase().includes(searchTerm)) ||
                (vacancy.Описание && vacancy.Описание.toLowerCase().includes(searchTerm));
            
            const matchesCity = !selectedCity || vacancy.Город === selectedCity;
            
            return matchesSearch && matchesCity;
        });
        
        renderVacancies(filtered);
    }

    function toggleLanguage() {
        currentLang = currentLang === 'ru' ? 'kz' : 'ru';
        updateLanguageElements();
        filterVacancies();
        updateTime();
    }

    function updateLanguageElements() {
        document.querySelectorAll('[data-lang]').forEach(el => {
            if (el.dataset.lang === currentLang || el.dataset.lang === 'both') {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }

    function getTranslation(key) {
        const translations = {
            'load_error': {
                'ru': 'Ошибка загрузки',
                'kz': 'Жүктеу қатесі'
            },
            'error_title': {
                'ru': 'Ошибка загрузки',
                'kz': 'Қате орын алды'
            },
            'try_again': {
                'ru': 'Попробовать снова',
                'kz': 'Қайтадан көру'
            },
            'all_cities': {
                'ru': 'Все города',
                'kz': 'Барлық қалалар'
            },
            'no_position': {
                'ru': 'Не указана',
                'kz': 'Көрсетілмеген'
            },
            'no_city': {
                'ru': 'Не указан',
                'kz': 'Көрсетілмеген'
            },
            'no_salary': {
                'ru': 'Не указана',
                'kz': 'Көрсетілмеген'
            },
            'no_description': {
                'ru': 'Нет описания',
                'kz': 'Сипаттама жоқ'
            },
            'apply': {
                'ru': 'Откликнуться',
                'kz': 'Жауап беру'
            }
        };
        
        return translations[key][currentLang] || key;
    }
});

function openWhatsApp(position) {
    const message = `Здравствуйте! Я хочу откликнуться на вакансию ${position}`;
    const url = `https://wa.me/${document.currentScript.getAttribute('data-whatsapp')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
