document.addEventListener("DOMContentLoaded", function () {
    const headerHTML = `
    <style>
      .main-header {

        border-bottom: 1px solid #222;
        position: relative;
        z-index: 1000;
      }
      
      /* Mobile search styles */
      .mobile-search {
        display: none;
        width: 100%;
        padding: 10px 15px;
        background: #1a1a1a;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1100;
        box-shadow: 0 2px 10px rgba(255, 255, 255, 0.3);
      }
      
      .mobile-search.active {
        display: block;
      }
      
      .mobile-search-close {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #fff;
        font-size: 1.2rem;
        cursor: pointer;
      }
      .navbar {
        padding: 0.6rem 0;
      }
      .navbar-brand {
        font-size: 1.8rem;
        font-weight: 700;
        color: #e50914 !important;
        padding: 0;
        margin-right: 3rem;
        position: relative;
      }
      .navbar-brand img {
        height: 36px;
        width: auto;
        transition: transform 0.3s ease;
      }
      .navbar-brand:hover img {
        transform: scale(1.05);
      }
      .nav-link {
        color: #e5e5e5 !important;
        font-weight: 500;
        padding: 0.7rem 1.2rem !important;
        margin: 0 0.1rem;
        position: relative;
        font-size: 0.95rem;
        letter-spacing: 0.3px;
      }
      .nav-link::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: #e50914;
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }
      .nav-link:hover::after, .nav-link.active::after {
        width: 60%;
      }
      .nav-link.active {
        color: #e50914 !important;
        font-weight: 600;
      }
      .search-box {
        position: relative;
        flex: 1;
        max-width: 500px;
        margin: 0 2.5rem;
      }
      .search-input {
        width: 100%;
        padding: 0.6rem 1.2rem;
        padding-right: 45px;
        border-radius: 30px;
        border: 1px solid #ffffffff;
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-size: 0.95rem;
        transition: all 0.3s ease;
      }
      .search-input:focus {
        outline: none;
        border-color: #e50914;
        box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
      }
      .search-btn {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        transition: color 0.2s ease;
      }
      .search-btn:hover {
        color: #e50914;
      }
      .user-actions {
        display: flex;
        gap: 0.8rem;
        align-items: center;
      }
      .btn-primary, .btn-outline {
        padding: 0.6rem 1.2rem;
        border-radius: 4px;
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.25s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .btn-primary {
        background-color: #e50914;
        color: white !important;
        border: none;
      }
      .btn-primary:hover {
        background-color: #f40612;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
      }
      .btn-outline {
        background: transparent;
        border: 1px solid #ffffffff;
        color: #e5e5e5 !important;
      }
      .btn-outline:hover {
        border-color: #e50914;
        color: #fff !important;
        background: rgba(229, 9, 20, 0.1);
      }
      @media (max-width: 991px) {
        .search-box {
          width: 100%;
          margin: 1rem 0;
          max-width: 100%;
        }
        .user-actions {
          margin-top: 1rem;
          width: 100%;
          justify-content: flex-start;
          gap: 0.8rem;
        }
        .navbar-brand h1{
          color: #fff;
          font-size: 1.8rem;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .nav-link {
          padding: 0.8rem 0 !important;
          margin: 0;
        }
        .nav-link::after {
          left: 0;
          transform: none;
          width: 0;
        }
        .nav-link:hover::after, .nav-link.active::after {
          width: 30px;
        }
       
      }
    </style>

    <header class="main-header">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <a class="navbar-brand" href="/">
              <h1>Dizi<span>com</span></h1>
          </a>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link ${window.location.pathname === '/index.html' || window.location.pathname === '/' ? 'active' : ''}" href="/index.html">
                  <i class="fas fa-home d-lg-none d-inline-block"></i>
                  <span>Anasayfa</span>
                </a>
              </li> 
              <li class="nav-item">
                <a class="nav-link ${window.location.pathname === '/diziler.html' ? 'active' : ''}" href="/diziler.html">
                  <i class="fas fa-tv d-lg-none d-inline-block"></i>
                  <span>Diziler</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${window.location.pathname === '/filmler.html' ? 'active' : ''}" href="/filmler.html">
                  <i class="fas fa-film d-lg-none d-inline-block"></i>
                  <span>Filmler</span>
                </a>
              </li>
            </ul>

            <!-- Mobile Search Toggle Button -->
            <button class="btn btn-link d-lg-none ms-2" id="mobileSearchToggle" style="color: #fff;">
              <i class="fas fa-search"></i>
            </button>
            
            <!-- Mobile Search Bar -->
            <div class="mobile-search" id="mobileSearchBar">
              <form id="mobileSearchForm" class="d-flex position-relative">
                <input class="form-control search-input" type="text" id="mobileSearchInput" placeholder="Dizi, film, oyuncu ara..." aria-label="Search" autocomplete="off">
                <button type="button" class="mobile-search-close" id="mobileSearchClose">
                  <i class="fas fa-times"></i>
                </button>
              </form>
            </div>
            
            <!-- Desktop Search Box -->
            <div class="search-box position-relative d-none d-lg-block">
              <form id="searchForm" class="d-flex">
                <input class="form-control search-input" type="text" id="searchInput" placeholder="Dizi, film, oyuncu ara..." aria-label="Search" autocomplete="off">
                <button class="search-btn" type="button" id="searchButton">
                  <i class="fas fa-search"></i>
                </button>
              </form>
              </div>
            </div>

            <style>
              .search-box {
                position: relative;
                width: 300px;
                margin-right: 15px;
              }
              .search-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                width: 300px;
                background: #ffffffff;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(255, 255, 255, 0.3);
                margin-top: 5px;
                z-index: 1000;
                border: 1px solid #333;
              }
              .search-filters {
                color: #fff;
              }
              .filter-section h6 {
                color: #e50914;
                font-size: 0.9rem;
                margin-bottom: 10px;
              }
              .form-check {
                margin-bottom: 5px;
              }
              .form-check-label {
                cursor: pointer;
              }
              .genre-tags {
                display: flex;
                flex-wrap: wrap;
              }
              .badge {
                cursor: pointer;
                transition: all 0.2s;
              }
              .badge.bg-danger {
                background-color: #e50914 !important;
              }
            </style>

            <div class="user-actions">
              <a href="https://mehmetcan1836.github.io/dizicomdownloader/" target="_blank" class="btn btn-primary">
                <i class="fas fa-mobile-alt me-1"></i>
                <span class="d-none d-md-inline">Uygulama</span>
              </a>
              <a href="/iletişim.html" class="btn btn-outline">
                <i class="fas fa-envelope me-1"></i>
                <span class="d-none d-md-inline">İletişim</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
    `;
    
    // Insert header into header-container or body
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
      headerContainer.innerHTML = headerHTML;
    } else {
      document.body.insertAdjacentHTML("afterbegin", headerHTML);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const searchButton = document.getElementById('searchButton');
    const mobileSearchToggle = document.getElementById('mobileSearchToggle');
    const mobileSearchBar = document.getElementById('mobileSearchBar');
    const mobileSearchClose = document.getElementById('mobileSearchClose');
    const searchDropdown = document.getElementById('searchDropdown');
    const applySearch = document.getElementById('applySearch');
    const clearFilters = document.getElementById('clearFilters');
    const genreTags = document.querySelectorAll('.genre-tags .badge');
    
    // Initialize search inputs with current query if any
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.has('q')) {
        const query = currentParams.get('q');
        if (searchInput) searchInput.value = query;
        if (mobileSearchInput) mobileSearchInput.value = query;
    }
    
    // Toggle mobile search bar
    if (mobileSearchToggle && mobileSearchBar) {
      mobileSearchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileSearchBar.classList.toggle('active');
        if (mobileSearchBar.classList.contains('active')) {
          mobileSearchInput.focus();
        }
      });
      
      mobileSearchClose.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileSearchBar.classList.remove('active');
      });
    }
    
    // Toggle search dropdown (desktop)
    if (searchButton && searchDropdown) {
      searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = searchDropdown.style.display === 'none' || !searchDropdown.style.display;
        searchDropdown.style.display = isHidden ? 'block' : 'none';
        
        if (isHidden) {
          searchInput.focus();
        }
      });
    }
    
    // Close dropdown when clicking outside
    if (searchDropdown) {
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box') && searchDropdown.style.display === 'block') {
          searchDropdown.style.display = 'none';
        }
      });
    }
    
    // Toggle genre selection
    if (genreTags && genreTags.length > 0) {
      genreTags.forEach(tag => {
        tag.addEventListener('click', () => {
          tag.classList.toggle('bg-danger');
          tag.classList.toggle('bg-secondary');
        });
      });
    }
    
    // Clear filters
    if (clearFilters) {
      clearFilters.addEventListener('click', () => {
        const typeRadios = document.querySelectorAll('input[name="type"]');
        if (typeRadios && typeRadios.length > 0) {
          typeRadios.forEach(radio => {
            if (radio.value === '') radio.checked = true;
            else radio.checked = false;
          });
        }
        
        if (genreTags && genreTags.length > 0) {
          genreTags.forEach(tag => {
            tag.classList.remove('bg-danger');
            tag.classList.add('bg-secondary');
          });
        }
      });
    }
    
    // Apply search
    function performSearch(inputElement) {
      const query = inputElement ? inputElement.value.trim() : '';
      const type = document.querySelector('input[name="type"]:checked')?.value || '';
      const selectedGenres = Array.from(document.querySelectorAll('.genre-tags .bg-danger'))
        .map(tag => tag.textContent.trim());
      
      // Only proceed if there's a search term or filters are applied
      if (query || type || selectedGenres.length > 0) {
        const params = new URLSearchParams();
        
        if (query) params.append('q', query);
        if (type) params.append('type', type);
        if (selectedGenres.length > 0) params.append('genre', selectedGenres.join(','));
        
        // Navigate to search results page
        window.location.href = '/arama.html?' + params.toString();
      } else {
        // If no search term or filters, show all results
        window.location.href = '/arama.html';
      }
      
      // Close dropdown and mobile search after search
      if (searchDropdown) {
        searchDropdown.style.display = 'none';
      }
      if (mobileSearchBar) {
        mobileSearchBar.classList.remove('active');
      }
    }
    
    // Event listeners
    if (applySearch) {
      applySearch.addEventListener('click', () => {
        // Use desktop search input if mobile input is not active
        const activeInput = mobileSearchBar && mobileSearchBar.classList.contains('active') ? mobileSearchInput : searchInput;
        performSearch(activeInput);
      });
    }
    
    // Handle Enter key in search inputs
    function handleSearchKeyPress(e, inputElement) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(inputElement);
      }
    }
    
    // Desktop search input
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => handleSearchKeyPress(e, searchInput));
      
      // Focus the search input when dropdown is shown
      searchInput.addEventListener('focus', () => {
        if (searchDropdown) {
          searchDropdown.style.display = 'block';
        }
      });
      
      // Handle search button click for desktop
      if (searchButton) {
        searchButton.addEventListener('click', (e) => {
          e.preventDefault();
          performSearch(searchInput);
        });
      }
    }
    
    // Mobile search input
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('keypress', (e) => {
        handleSearchKeyPress(e, mobileSearchInput);
      });
      
      // Close mobile search when clicking outside
      document.addEventListener('click', (e) => {
        if (mobileSearchBar && !mobileSearchBar.contains(e.target) && !mobileSearchToggle.contains(e.target)) {
          mobileSearchBar.classList.remove('active');
        }
      });
      
      // Handle mobile search form submission
      const mobileSearchForm = document.getElementById('mobileSearchForm');
      if (mobileSearchForm) {
        mobileSearchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          performSearch(mobileSearchInput);
        });
      }
    }
    // header.js
document.addEventListener('DOMContentLoaded', async function() {
  // Film sayfasında izlenme takibi
  const movieId = new URLSearchParams(window.location.search).get('id');
  if (movieId) {
      try {
          await fetch(`/api/movies/${movieId}/views`, {
              method: 'POST'
          });
      } catch (error) {
          console.error('İzlenme takibi başarısız:', error);
      }
  }

  // Popüler içerikleri yükle
  try {
      const [movies, series] = await Promise.all([
          fetch('/api/popular/movies').then(res => res.json()),
          fetch('/api/popular/series').then(res => res.json())
      ]);

      // Popüler filmleri göster
      displayPopularMovies(movies);
      // Popüler dizileri göster
      displayPopularSeries(series);
  } catch (error) {
      console.error('Popüler içerik yüklenemedi:', error);
  }
});
  });
  