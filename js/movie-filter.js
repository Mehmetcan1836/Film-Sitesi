// Function to generate movie HTML
function createMovieElement(movie) {
    return `
        <div class="box">
            <a href="${movie.link}">
                <img loading="lazy" src="${movie.image}" alt="${movie.title}">
                <div class="info-panel">
                    <h3>${movie.title}</h3>
                    <div class="movie-meta">
                        <span class="year">${movie.year}</span>
                        <span class="genre">${movie.genre}</span>
                        <span class="rating">
                            <i class="fas fa-star"></i> ${movie.rating}
                        </span>
                    </div>
                </div>
            </a>
            <button class="favorite-btn" aria-label="Favorilere Ekle">
                <i class="far fa-heart"></i>
            </button>
        </div>
    `;
}

// Function to filter movies
function filterMovies() {
    const genreFilters = Array.from(document.querySelectorAll('.filter-sidebar input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const yearFrom = document.getElementById('yearFrom').value || 0;
    const yearTo = document.getElementById('yearTo').value || 9999;
    
    const rating = document.getElementById('ratingRange').value;

    // Combine movies and series into one array
    const allContent = [...movies, ...diziler];

    // Filter content
    const filteredContent = allContent.filter(content => {
        const matchesGenre = genreFilters.length === 0 || genreFilters.includes(content.genre);
        const matchesYear = content.year >= parseInt(yearFrom) && content.year <= parseInt(yearTo);
        const matchesRating = content.rating >= parseFloat(rating);
        
        return matchesGenre && matchesYear && matchesRating;
    });

    // Update movie grid
    const movieGrid = document.querySelector('.movie-grid');
    movieGrid.innerHTML = filteredContent.map(content => createMovieElement(content)).join('');

    // Update series section
    const seriesSection = document.querySelector('.featured-section:last-child');
    if (seriesSection) {
        const seriesGrid = seriesSection.querySelector('.movie-grid');
        if (seriesGrid) {
            seriesGrid.innerHTML = filteredContent
                .filter(content => content.genre === "Animasyon")
                .map(content => createMovieElement(content))
                .join('');
        }
    }
}

// Initialize filters
document.addEventListener('DOMContentLoaded', () => {
    // Populate initial content
    const movieGrid = document.querySelector('.movie-grid');
    if (movieGrid) {
        movieGrid.innerHTML = movies.map(movie => createMovieElement(movie)).join('');
    }

    // Create and populate series section
    const seriesSection = `
        <section class="featured-section">
            <div class="section-header">
                <h2><i class="fas fa-tv"></i> Popüler Diziler</h2>
                <a href="diziler.html" class="view-all">Tümünü Gör <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="movie-grid">
                ${diziler.map(serie => createMovieElement(serie)).join('')}
            </div>
            <div class="navigation">
                <a href="#"><i class="fas fa-chevron-left"></i> Önceki</a>
                <a href="#" class="active">1</a>
                <a href="#">2</a>
                <a href="#">3</a>
                <a href="#">Sonraki <i class="fas fa-chevron-right"></i></a>
            </div>
        </section>
    `;

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertAdjacentHTML('beforeend', seriesSection);
    }

    // Add click event for favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle('active');
            btn.querySelector('i').classList.toggle('far');
            btn.querySelector('i').classList.toggle('fas');
        });
    });

    // Add filter event listeners
    document.querySelector('.filter-sidebar .btn-primary').addEventListener('click', filterMovies);

    // Reset filters
    document.querySelector('.filter-sidebar .btn-outline-primary').addEventListener('click', () => {
        document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('yearFrom').value = '';
        document.getElementById('yearTo').value = '';
        document.getElementById('ratingRange').value = '7.0';
        filterMovies();
    });

    // Update rating display when slider changes
    const ratingRange = document.getElementById('ratingRange');
    const ratingValue = document.getElementById('ratingValue');
    
    ratingRange.addEventListener('input', function() {
        ratingValue.textContent = this.value;
    });
});
