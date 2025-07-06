// Function to fetch and display content
async function displayContent() {
    try {
        const response = await fetch('../data/movies.json');
        const data = await response.json();
        
        // Display movies
        const movieGrid = document.querySelector('.movie-grid');
        if (movieGrid) {
            movieGrid.innerHTML = data.movies
                .filter(movie => movie.type === 'film')
                .map(movie => createContentElement(movie))
                .join('');
        }

        // Create and display series section
        const seriesSection = createSeriesSection(data.movies.filter(movie => movie.type === 'dizi'));
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('beforeend', seriesSection);
        }

        // Initialize favorite buttons
        initializeFavorites();
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// Function to create content element
function createContentElement(content) {
    return `
        <div class="box">
            <a href="${content.link}">
                <img loading="lazy" src="${content.image}" alt="${content.title}">
                <div class="info-panel">
                    <h3>${content.title}</h3>
                    <div class="movie-meta">
                        <span class="year">${content.year}</span>
                        <span class="genre">${content.genre}</span>
                        <span class="rating">
                            <i class="fas fa-star"></i> ${content.rating}
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

// Function to create series section
function createSeriesSection(series) {
    return `
        <section class="featured-section">
            <div class="section-header">
                <h2><i class="fas fa-tv"></i> Popüler Diziler</h2>
                <a href="diziler.html" class="view-all">Tümünü Gör <i class="fas fa-arrow-right"></i></a>
            </div>
            <div class="movie-grid">
                ${series.map(serie => createContentElement(serie)).join('')}
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
}

// Function to initialize favorite buttons
function initializeFavorites() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle('active');
            btn.querySelector('i').classList.toggle('far');
            btn.querySelector('i').classList.toggle('fas');
        });
    });
}

// Initialize content display when DOM is loaded
document.addEventListener('DOMContentLoaded', displayContent);
