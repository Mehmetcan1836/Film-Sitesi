document.addEventListener("DOMContentLoaded", function () {
    const headerHTML = `
    <style>
      .main-header {
        background: linear-gradient(180deg, #141414 0%, #0a0a0a 100%);
        border-bottom: 1px solid #222;
        position: relative;
        z-index: 1000;
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
        border: 1px solid #333;
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
        font-size: 0.95rem;
        transition: all 0.3s ease;
      }
      .search-input:focus {
        outline: none;
        border-color: #e50914;
        box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
        background: rgba(255, 255, 255, 0.08);
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
        border: 1px solid #444;
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

            <div class="search-box">
              <form action="/arama.html" method="GET" class="d-flex">
                <input class="form-control search-input" type="search" name="q" placeholder="Dizi, film, oyuncu ara..." aria-label="Search">
                <button class="search-btn" type="submit">
                  <i class="fas fa-search"></i>
                </button>
              </form>
            </div>

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
    document.body.insertAdjacentHTML("afterbegin", headerHTML);
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
  