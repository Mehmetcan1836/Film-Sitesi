// Sample series data - In a real app, this would come from an API
const diziler = [
    {
        title: "Regular Show",
        year: 2010,
        genre: "Animasyon",
        rating: 8.5,
        image: "img/regularshows1.jpg",
        link: "Diziler/RegularShow/regularshow.html"
    },
    {
        title: "Ben 10 Classic",
        year: 2005,
        genre: "Animasyon",
        rating: 8.5,
        image: "img/869.jpg",
        link: "Diziler/Ben10 Classic/ben10.html"
    },
    {
        title: "Esrarengiz Kasaba",
        year: 2012,
        genre: "Animasyon",
        rating: 8.5,
        image: "img/esrarengizkasaba.jpg",
        link: "Diziler/Esrarengiz Kasaba/esrarengizkasaba.html"
    },
    {
        title: "Çarpışma",
        year: 2018,
        genre: "Aksiyon",
        rating: 8.5,
        image: "img/Çarpışma.jpg",
        link: "Diziler/Çarpışma/Çarpışma.html"
    },
    {
        title: "Kuzey Güney",
        year: 2011,
        genre: "Aksiyon",
        rating: 8.5,
        image: "img/Kuzey Güney.jpg",
        link: "Diziler/Kuzey Güney/Kuzey Güney.html"
    }
];

// Function to generate series HTML
function createSeriesElement(serie) {
    return `
        <div class="box">
            <a href="${serie.link}">
                <img loading="lazy" src="${serie.image}" alt="${serie.title}">
                <div class="info-panel">
                    <h3>${serie.title}</h3>
                    <div class="movie-meta">
                        <span class="year">${serie.year}</span>
                        <span class="genre">${serie.genre}</span>
                        <span class="rating">
                            <i class="fas fa-star"></i> ${serie.rating}
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

// Function to filter series
function filterSeries() {
    const genreFilters = Array.from(document.querySelectorAll('.filter-sidebar input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const yearFrom = document.getElementById('yearFrom').value || 0;
    const yearTo = document.getElementById('yearTo').value || 9999;
    
    const rating = document.getElementById('ratingRange').value;

    // Filter series
    const filteredSeries = diziler.filter(serie => {
        const matchesGenre = genreFilters.length === 0 || genreFilters.includes(serie.genre);
        const matchesYear = serie.year >= parseInt(yearFrom) && serie.year <= parseInt(yearTo);
        const matchesRating = serie.rating >= parseFloat(rating);
        
        return matchesGenre && matchesYear && matchesRating;
    });

    // Update series grid
    const seriesGrid = document.querySelector('.movie-grid');
    seriesGrid.innerHTML = filteredSeries.map(serie => createSeriesElement(serie)).join('');
}

// Initialize filters
document.addEventListener('DOMContentLoaded', () => {
    // Populate initial content
    const seriesGrid = document.querySelector('.movie-grid');
    if (seriesGrid) {
        seriesGrid.innerHTML = diziler.map(serie => createSeriesElement(serie)).join('');
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
    document.querySelector('.filter-sidebar .btn-primary').addEventListener('click', filterSeries);

    // Reset filters
    document.querySelector('.filter-sidebar .btn-outline-primary').addEventListener('click', () => {
        document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('yearFrom').value = '';
        document.getElementById('yearTo').value = '';
        document.getElementById('ratingRange').value = '7.0';
        filterSeries();
    });

    // Update rating display when slider changes
    const ratingRange = document.getElementById('ratingRange');
    const ratingValue = document.getElementById('ratingValue');
    
    ratingRange.addEventListener('input', function() {
        ratingValue.textContent = this.value;
    });
});
