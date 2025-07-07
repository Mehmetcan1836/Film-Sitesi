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
    try {
        const genreFilters = Array.from(document.querySelectorAll('.filter-sidebar input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        
        const yearFrom = document.getElementById('yearFrom').value || 0;
        const yearTo = document.getElementById('yearTo').value || 9999;
        
        const rating = document.getElementById('ratingRange').value || 0;

        console.log('Filtering with:', { genreFilters, yearFrom, yearTo, rating });

        // Make sure window.seriesData is available
        const seriesData = window.seriesData || [];
        console.log('Total series:', seriesData.length);

        // Filter series
        const filteredSeries = seriesData.filter(serie => {
            if (!serie) return false;
            
            const matchesGenre = genreFilters.length === 0 || genreFilters.includes(serie.genre);
            const matchesYear = parseInt(serie.year) >= parseInt(yearFrom) && 
                              parseInt(serie.year) <= parseInt(yearTo);
            const matchesRating = parseFloat(serie.rating) >= parseFloat(rating);
            
            return matchesGenre && matchesYear && matchesRating;
        });

        console.log('Filtered series count:', filteredSeries.length);

        // Update series grid
        const seriesGrid = document.querySelector('.movie-grid');
        if (seriesGrid) {
            if (filteredSeries.length === 0) {
                seriesGrid.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4>Filtrelere uygun dizi bulunamadı</h4>
                        <p>Farklı filtreler deneyebilirsiniz.</p>
                    </div>
                `;
            } else {
                seriesGrid.innerHTML = filteredSeries.map(serie => createSeriesElement(serie)).join('');
            }
        }
    } catch (error) {
        console.error('Filtreleme sırasında hata oluştu:', error);
    }
}

// Initialize filters
document.addEventListener('DOMContentLoaded', () => {
    // Function to initialize filter events
    function initializeFilters() {
        // Update rating display when slider changes
        const ratingRange = document.getElementById('ratingRange');
        const ratingValue = document.getElementById('ratingValue');
        
        if (ratingRange && ratingValue) {
            ratingRange.addEventListener('input', function() {
                ratingValue.textContent = parseFloat(this.value).toFixed(1);
            });
        }

        // Add filter event listeners to all filter inputs
        const filterInputs = [
            document.getElementById('yearFrom'),
            document.getElementById('yearTo'),
            document.getElementById('ratingRange'),
            ...document.querySelectorAll('.filter-sidebar input[type="checkbox"]')
        ];
        
        filterInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', filterSeries);
                input.addEventListener('input', filterSeries);
            }
        });
        
        // Apply filter button
        const applyBtn = document.querySelector('.filter-sidebar .btn-primary');
        if (applyBtn) {
            applyBtn.addEventListener('click', filterSeries);
        }
        
        // Reset filters button
        const resetBtn = document.querySelector('.filter-sidebar .btn-outline-primary');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // Reset checkboxes
                document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Reset year inputs
                document.getElementById('yearFrom').value = '';
                document.getElementById('yearTo').value = '';
                
                // Reset rating
                if (ratingRange) {
                    ratingRange.value = 0;
                    if (ratingValue) ratingValue.textContent = '0.0';
                }
                
                // Reapply filter
                filterSeries();
            });
        }
        
        // Initial filter
        filterSeries();
    }
    
    // Initialize filters after a short delay to ensure DOM is ready
    setTimeout(initializeFilters, 100);
    
    // Also initialize when the page is fully loaded
    window.addEventListener('load', initializeFilters);
});
