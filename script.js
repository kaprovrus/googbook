document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('vacancies-container');
    const search = document.getElementById('search');
    const cityFilter = document.getElementById('city-filter');
    const refreshBtn = document.getElementById('refresh');
    
    let vacancies = [];
    let cities = new Set();

    // Загрузка данных
    async function loadData() {
        try {
            showLoading();
            
            // Сначала пробуем локальный файл
            const response = await fetch('data/vacancies.json');
            if (!response.ok) throw new Error('Failed to load local data');
            
            const data = await response.json();
            vacancies = data;
            processData();
            renderVacancies();
        } catch (error) {
            console.error('Using fallback API:', error);
            // Fallback к Google API
            const apiResponse = await fetch('https://script.google.com/macros/s/AKfycbzhAX4GPquWSxKoinrlb-OIvyj5H47NdYUn9hnEzKl4e1lTdLgRiZE_zEr5qA5aq9AC/exec');
            vacancies = await apiResponse.json();
            processData();
            renderVacancies();
        }
    }

    function showLoading() {
        container.innerHTML = `
            <div class="loader">
                <div class="spinner"></div>
                <p>Загрузка вакансий...</p>
            </div>
        `;
    }

    function processData() {
        cities.clear();
        cityFilter.innerHTML = '<option value="">Все города</option>';
        
        vacancies.forEach(v => {
            if (v.city) cities.add(v.city);
        });
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            cityFilter.appendChild(option);
        });
    }

    function renderVacancies(data = vacancies) {
        container.innerHTML = '';
        
        if (data.length === 0) {
            container.innerHTML = '<p>Вакансии не найдены</p>';
            return;
        }
        
        data.forEach(v => {
            const vacancy = document.createElement('div');
            vacancy.className = 'vacancy';
            vacancy.innerHTML = `
                <h2>${v.position}</h2>
                <div class="meta">
                    <span>${v.company}</span> • 
                    <span>${v.city}</span>
                </div>
                <p>${v.description}</p>
                <div class="salary">${v.salary}</div>
            `;
            container.appendChild(vacancy);
        });
    }

    function filterVacancies() {
        const searchTerm = search.value.toLowerCase();
        const city = cityFilter.value;
        
        const filtered = vacancies.filter(v => {
            const matchesSearch = 
                v.position.toLowerCase().includes(searchTerm) ||
                v.company.toLowerCase().includes(searchTerm);
            
            const matchesCity = !city || v.city === city;
            
            return matchesSearch && matchesCity;
        });
        
        renderVacancies(filtered);
    }

    search.addEventListener('input', filterVacancies);
    cityFilter.addEventListener('change', filterVacancies);
    refreshBtn.addEventListener('click', loadData);

    loadData();
});
