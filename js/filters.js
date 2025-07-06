// Filter Sidebar Component
function createFilterSidebar() {
    return `
        <div class="filter-toggle">
            <i class="fas fa-filter"></i>
        </div>
        <aside class="filter-sidebar">
            <div class="filter-section">
                <h4><i class="fas fa-filter"></i> Filtrele</h4>
                
                <!-- Content Type Filter -->
                <div class="filter-group">
                    <h4>İçerik Türü</h4>
                    <div class="form-check">
                        <input class="form-check-input content-type-filter" type="checkbox" value="film" id="filmFilter">
                        <label class="form-check-label" for="filmFilter">
                            <i class="fas fa-film"></i> Filmler
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input content-type-filter" type="checkbox" value="dizi" id="diziFilter">
                        <label class="form-check-label" for="diziFilter">
                            <i class="fas fa-tv"></i> Diziler
                        </label>
                    </div>
                </div>

                <!-- Genre Filter -->
                <div class="filter-group">
                    <h4>Tür</h4>
                    <div class="form-check">
                        <input class="form-check-input genre-filter" type="checkbox" value="Aksiyon" id="actionFilter">
                        <label class="form-check-label" for="actionFilter">
                            <i class="fas fa-fist-raised"></i> Aksiyon
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input genre-filter" type="checkbox" value="Komedi" id="comedyFilter">
                        <label class="form-check-label" for="comedyFilter">
                            <i class="fas fa-laugh"></i> Komedi
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input genre-filter" type="checkbox" value="Animasyon" id="animationFilter">
                        <label class="form-check-label" for="animationFilter">
                            <i class="fas fa-draw-polygon"></i> Animasyon
                        </label>
                    </div>
                </div>

                <!-- Year Range Filter -->
                <div class="filter-group">
                    <h4>Yıl Aralığı</h4>
                    <div class="form-group">
                        <div class="input-group">
                            <input type="number" class="form-control year-min" min="1900" max="2025" value="1900" placeholder="Başlangıç Yılı">
                            <span class="input-group-text">-</span>
                            <input type="number" class="form-control year-max" min="1900" max="2025" value="2025" placeholder="Bitiş Yılı">
                        </div>
                        <input type="range" class="form-range year-slider-min" min="1900" max="2025" value="1900">
                        <input type="range" class="form-range year-slider-max" min="1900" max="2025" value="2025">
                    </div>
                </div>

                <!-- Rating Filter -->
                <div class="filter-group">
                    <h4>Rating</h4>
                    <div class="form-group">
                        <input type="range" class="form-range rating-slider" min="0" max="10" step="0.1" value="0">
                        <div class="rating-display">
                            <i class="fas fa-star"></i>
                            <span class="rating-value">0.0</span>/10
                        </div>
                    </div>
                </div>

                <div class="filter-actions">
                    <button class="btn btn-primary w-100 mb-2" type="button" onclick="applyFilters()">
                        <i class="fas fa-filter"></i> Filtreleri Uygula
                    </button>
                    <button class="btn btn-outline-primary w-100" type="button" onclick="resetFilters()">
                        <i class="fas fa-undo"></i> Sıfırla
                    </button>
                </div>
            </div>
        </aside>
    `;
}

// Initialize Filters
function initializeFilters() {
    // Add filter sidebar and toggle button
    document.body.insertAdjacentHTML('beforeend', createFilterSidebar());

    // Initialize range sliders
    const yearSliderMin = document.querySelector('.year-slider-min');
    const yearSliderMax = document.querySelector('.year-slider-max');
    const yearMinInput = document.querySelector('.year-min');
    const yearMaxInput = document.querySelector('.year-max');
    const ratingSlider = document.querySelector('.rating-slider');
    const ratingValue = document.querySelector('.rating-value');

    // Sync year sliders with inputs
    yearSliderMin.addEventListener('input', () => {
        const min = parseInt(yearSliderMin.value);
        const max = parseInt(yearSliderMax.value);
        yearMinInput.value = min;
        if (min > max) yearSliderMax.value = min;
    });

    yearSliderMax.addEventListener('input', () => {
        const min = parseInt(yearSliderMin.value);
        const max = parseInt(yearSliderMax.value);
        yearMaxInput.value = max;
        if (max < min) yearSliderMin.value = max;
    });

    // Sync year inputs with sliders
    yearMinInput.addEventListener('change', () => {
        yearSliderMin.value = yearMinInput.value;
    });

    yearMaxInput.addEventListener('change', () => {
        yearSliderMax.value = yearMaxInput.value;
    });

    // Update rating value
    ratingSlider.addEventListener('input', () => {
        ratingValue.textContent = ratingSlider.value;
    });

    // Mobile toggle functionality
    const filterToggle = document.querySelector('.filter-toggle');
    const filterSidebar = document.querySelector('.filter-sidebar');

    filterToggle.addEventListener('click', () => {
        filterSidebar.classList.toggle('show');
    });

    // Close filter when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterToggle.contains(e.target) && !filterSidebar.contains(e.target)) {
            filterSidebar.classList.remove('show');
        }
    });

    // Apply filters button
    document.querySelector('.apply-filters').addEventListener('click', applyFilters);
    document.querySelector('.reset-filters').addEventListener('click', resetFilters);
}

// Apply filters to content
function applyFilters() {
    const filters = {
        contentTypes: Array.from(document.querySelectorAll('.content-type-filter:checked')).map(cb => cb.value),
        genres: Array.from(document.querySelectorAll('.genre-filter:checked')).map(cb => cb.value),
        yearMin: parseInt(document.querySelector('.year-min').value),
        yearMax: parseInt(document.querySelector('.year-max').value),
        rating: parseFloat(document.querySelector('.rating-slider').value)
    };

    filterContent(filters);
}

// Reset filters
function resetFilters() {
    document.querySelectorAll('.content-type-filter').forEach(cb => cb.checked = true);
    document.querySelectorAll('.genre-filter').forEach(cb => cb.checked = false);
    document.querySelector('.year-min').value = 1900;
    document.querySelector('.year-max').value = 2025;
    document.querySelector('.year-slider-min').value = 1900;
    document.querySelector('.year-slider-max').value = 2025;
    document.querySelector('.rating-slider').value = 0;
    document.querySelector('.rating-value').textContent = '0.0';
    
    applyFilters();
}

// Filter content based on filters
function filterContent(filters) {
    const movies = document.querySelectorAll('.movie-grid .box');
    
    movies.forEach(movie => {
        const movieData = {
            type: movie.closest('a').href.split('/').pop().split('.')[0],
            genre: movie.querySelector('.genre').textContent,
            year: parseInt(movie.querySelector('.year').textContent),
            rating: parseFloat(movie.querySelector('.rating').textContent)
        };

        const showMovie = 
            (filters.contentTypes.length === 0 || filters.contentTypes.includes(movieData.type)) &&
            (!filters.genres.length || filters.genres.includes(movieData.genre)) &&
            movieData.year >= filters.yearMin && movieData.year <= filters.yearMax &&
            movieData.rating >= filters.rating;

        movie.style.display = showMovie ? 'block' : 'none';
    });
}

// Initialize filters when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFilters);
