// API Configuration
const API_KEY = "999a2c8d29cd1833fa98446f909f19eb"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"
const VIDSRC_BASE_URL = "https://vidsrc.cc"

// Mobile detection and optimized settings
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
const MIN_SEARCH_LENGTH = 2
const SCROLL_THRESHOLD = isMobile ? 800 : 1000

// Network configuration for mobile optimization
const NETWORK_CONFIG = {
  timeout: isMobile ? 15000 : 10000, // Longer timeout for mobile
  retryAttempts: 3,
  retryDelay: 1000,
  maxConcurrentRequests: isMobile ? 2 : 4,
}

// DOM Elements
const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")
const mediaModalElement = document.getElementById("mediaModal")
const playerModalElement = document.getElementById("playerModal")

// Bootstrap Modal Initialization
const bootstrap = window.bootstrap
const mediaModal = new bootstrap.Modal(mediaModalElement)
const playerModal = new bootstrap.Modal(playerModalElement)

// Global variables
let currentMedia = null
let currentSeasons = []
let currentSeason = null
let currentEpisode = null
const currentSection = "home"
let isLoading = false
let scrollTimeout = null
const activeRequests = new Set()

// Pagination variables
const currentPages = {
  popularMovies: 1,
  popularTVShows: 1,
  moviesSection: 1,
  tvSection: 1,
  search: 1,
  genre: 1,
  trending: 1,
  comedy: 1,
  bengali: 1,
}

const hasMorePages = {
  popularMovies: true,
  popularTVShows: true,
  moviesSection: true,
  tvSection: true,
  search: true,
  genre: true,
  trending: true,
  comedy: true,
  bengali: true,
}

let currentSearchQuery = ""
let currentGenreId = null
let currentGenreName = ""

// Enhanced fetch function with timeout and retry logic
async function fetchWithRetry(url, options = {}, retries = NETWORK_CONFIG.retryAttempts) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_CONFIG.timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (retries > 0 && !controller.signal.aborted) {
      console.warn(`⚠️ Request failed, retrying... (${retries} attempts left)`)
      await new Promise((resolve) => setTimeout(resolve, NETWORK_CONFIG.retryDelay))
      return fetchWithRetry(url, options, retries - 1)
    }

    throw error
  }
}

// Request queue manager for mobile optimization
class RequestQueue {
  constructor(maxConcurrent = NETWORK_CONFIG.maxConcurrentRequests) {
    this.maxConcurrent = maxConcurrent
    this.running = 0
    this.queue = []
  }

  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject })
      this.process()
    })
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.running++
    const { requestFn, resolve, reject } = this.queue.shift()

    try {
      const result = await requestFn()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.running--
      this.process()
    }
  }
}

const requestQueue = new RequestQueue()

// Function to show a section
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section")
  sections.forEach((section) => {
    section.classList.remove("active")
  })

  // Hide hero section for non-home sections
  const heroSection = document.getElementById("heroSection")
  if (sectionId === "home") {
    heroSection.style.display = "block"
  } else {
    heroSection.style.display = "none"
  }

  const section = document.getElementById(sectionId + "Section")
  if (section) {
    section.classList.add("active")
  }

  // Load section data if needed
  if (sectionId === "movies") {
    loadMoviesSection()
  } else if (sectionId === "tv") {
    loadTVSection()
  }
}

// Go home function
function goHome() {
  showSection("home")
}

// Navigate to detail page
function goToDetailPage(mediaId, mediaType) {
  window.location.href = `detail.html?id=${mediaId}&type=${mediaType}`
}

function playMovie(movieId) {
  // Show loading spinner
  document.getElementById('videoPlayerSection').style.display = 'block';
  document.getElementById('videoContent').innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <span>Video yükleniyor...</span>
    </div>
  `;

  // Scroll to player
  document.getElementById('videoPlayerSection').scrollIntoView({ behavior: 'smooth' });

  // Fetch movie details
  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=tr-TR`)
    .then(response => response.json())
    .then(movie => {
      document.getElementById('playerTitle').textContent = movie.title;

      // Get video sources
      return fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}&language=tr-TR`);
    })
    .then(response => response.json())
    .then(data => {
      const videos = data.results;
      let videoUrl = null;

      // Try to find Turkish video first, then English
      const turkishVideo = videos.find(v => v.site === 'YouTube' && (v.name.toLowerCase().includes('türkçe') || v.name.toLowerCase().includes('trailer')));
      const englishVideo = videos.find(v => v.site === 'YouTube');

      if (turkishVideo) {
        videoUrl = `https://www.youtube.com/embed/${turkishVideo.key}?autoplay=1&rel=0`;
      } else if (englishVideo) {
        videoUrl = `https://www.youtube.com/embed/${englishVideo.key}?autoplay=1&rel=0`;
      }

      if (videoUrl) {
        document.getElementById('videoContent').innerHTML = `
          <iframe class="video-iframe" src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
        `;
      } else {
        document.getElementById('videoContent').innerHTML = `
          <div class="loading-spinner">
            <span>Video bulunamadı</span>
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('Error loading movie video:', error);
      document.getElementById('videoContent').innerHTML = `
        <div class="loading-spinner">
          <span>Video yüklenirken hata oluştu</span>
        </div>
      `;
    });
}

function hidePlayer() {
  document.getElementById('videoPlayerSection').style.display = 'none';
  document.getElementById('videoContent').innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <span>Video yükleniyor...</span>
    </div>
  `;
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initializing Movie Streaming App")
  console.log("📱 Mobile device:", isMobile)
  console.log("🌐 Network timeout:", NETWORK_CONFIG.timeout + "ms")

  // Page detection based on current URL
  const currentPage = window.location.pathname
  console.log("📄 Current page:", currentPage)

  if (currentPage.includes("filmler.html")) {
    console.log("📽️ Movies page detected - loading movies section")
    loadMoviesSection()
  } else if (currentPage.includes("diziler.html")) {
    console.log("📺 TV shows page detected - loading TV section")
    loadTVSection()
  } else {
    console.log("🏠 Home page detected - loading initial data")
    loadInitialData()
  }

  setupEventListeners()
  setupInfiniteScroll()
  setupNetworkMonitoring()
  setupMovieRequestForm()
})

// Network monitoring for better error handling
function setupNetworkMonitoring() {
  if ("connection" in navigator) {
    const connection = navigator.connection
    console.log(`📶 Network: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`)

    // Adjust timeout based on connection speed
    if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
      NETWORK_CONFIG.timeout = 25000
      NETWORK_CONFIG.maxConcurrentRequests = 1
    }
  }

  // Monitor online/offline status
  window.addEventListener("online", () => {
    console.log("📶 Back online - retrying failed requests")
    retryFailedSections()
  })

  window.addEventListener("offline", () => {
    console.log("📵 Gone offline")
  })
}

// Retry failed sections when back online
function retryFailedSections() {
  const failedSections = document.querySelectorAll(".error-state")
  failedSections.forEach((section) => {
    const retryBtn = section.querySelector(".retry-button")
    if (retryBtn) {
      retryBtn.click()
    }
  })
}

// Event Listeners - UPDATED WITHOUT AUTO-SEARCH
function setupEventListeners() {
  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch)
  }

  if (searchInput) {
    // Only clear search results when input is completely empty
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim()

      if (query.length === 0) {
        showSection("home")
        currentSearchQuery = ""
      }
    })

    // Search only on Enter key press
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch()
      }
    })
  }

  // Tab change events
  const tvTab = document.getElementById("tv-tab")
  if (tvTab) {
    tvTab.addEventListener("shown.bs.tab", () => {
      const container = document.getElementById("popularTVShows")
      if (container && container.innerHTML.includes("Loading")) {
        loadPopularTVShows()
      }
    })
  }

  // Close player when modal is closed
  if (playerModalElement) {
    playerModalElement.addEventListener("hidden.bs.modal", () => {
      const iframe = document.getElementById("playerIframe")
      if (iframe) {
        iframe.src = ""
      }
    })
  }

  // Load More buttons (manual load more)
  const moviesLoadMoreBtn = document.getElementById('moviesLoadMoreBtn')
  if (moviesLoadMoreBtn) {
    moviesLoadMoreBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      if (isLoading || !hasMorePages.moviesSection) return
      moviesLoadMoreBtn.disabled = true
      const spinner = document.getElementById('moviesLoadMoreSpinner')
      if (spinner) spinner.style.display = 'inline-block'
      try {
        await loadMoreMoviesSection()
      } catch (err) {
        console.error('Error loading more movies via button:', err)
      } finally {
        if (spinner) spinner.style.display = 'none'
        if (!hasMorePages.moviesSection) {
          moviesLoadMoreBtn.style.display = 'none'
        } else {
          moviesLoadMoreBtn.disabled = false
        }
      }
    })
  }

  const tvLoadMoreBtn = document.getElementById('tvLoadMoreBtn')
  if (tvLoadMoreBtn) {
    tvLoadMoreBtn.addEventListener('click', async (e) => {
      e.preventDefault()
      if (isLoading || !hasMorePages.tvSection) return
      tvLoadMoreBtn.disabled = true
      const spinner = document.getElementById('tvLoadMoreSpinner')
      if (spinner) spinner.style.display = 'inline-block'
      try {
        await loadMoreTVSection()
      } catch (err) {
        console.error('Error loading more TV via button:', err)
      } finally {
        if (spinner) spinner.style.display = 'none'
        if (!hasMorePages.tvSection) {
          tvLoadMoreBtn.style.display = 'none'
        } else {
          tvLoadMoreBtn.disabled = false
        }
      }
    })
  }
}

// Update visibility/state of load more buttons based on pagination
function updateLoadMoreButtons() {
  const moviesBtn = document.getElementById('moviesLoadMoreBtn')
  if (moviesBtn) moviesBtn.style.display = hasMorePages.moviesSection ? 'inline-block' : 'none'

  const tvBtn = document.getElementById('tvLoadMoreBtn')
  if (tvBtn) tvBtn.style.display = hasMorePages.tvSection ? 'inline-block' : 'none'
}

// Setup Movie Request Form
function setupMovieRequestForm() {
  const form = document.getElementById("movieRequestForm")
  if (!form) return

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    
    const submitBtn = document.getElementById("submitBtn")
    const formMessage = document.getElementById("formMessage")
    
    // Add your Web3Forms API key to the form data
    const formData = new FormData(form)
    formData.append("access_key", "108ed3e8-e32f-4b50-be8e-2c59ee895c9a")

    // Disable submit button and show loading
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...'
    
    try {
      // Send to Web3Forms
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Show success message
        formMessage.innerHTML = `
          <div class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Request Submitted Successfully!</strong><br>
            Thank you for your movie request. We'll review it and try to add it to our collection soon.
          </div>
        `
        formMessage.style.display = "block"
        
        // Reset form
        form.reset()
        
        console.log("✅ Movie request submitted successfully")
      } else {
        throw new Error(result.message || "Submission failed")
      }
    } catch (error) {
      console.error("❌ Error submitting movie request:", error)
      
      // Show error message
      formMessage.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Submission Failed!</strong><br>
          There was an error submitting your request. Please try again later.
        </div>
      `
      formMessage.style.display = "block"
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false
      submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Request'
      
      // Hide message after 5 seconds
      setTimeout(() => {
        formMessage.style.display = "none"
      }, 5000)
    }
  })
}

// Setup Infinite Scroll with mobile optimization
function setupInfiniteScroll() {
  let isScrolling = false

  window.addEventListener("scroll", () => {
    if (isScrolling || isLoading) return

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - SCROLL_THRESHOLD) {
      isScrolling = true

      // Throttle scroll events for mobile
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(
        () => {
          isScrolling = false
        },
        isMobile ? 300 : 100,
      )

      const activeSection = document.querySelector(".content-section.active")
      if (!activeSection) return

      const sectionId = activeSection.id

      switch (sectionId) {
        case "homeSection":
          const activeTab = document.querySelector(".nav-link.active")
          if (activeTab && activeTab.id === "movies-tab" && hasMorePages.popularMovies) {
            loadMorePopularMovies()
          } else if (activeTab && activeTab.id === "tv-tab" && hasMorePages.popularTVShows) {
            loadMorePopularTVShows()
          }
          break
        case "moviesSection":
          if (hasMorePages.moviesSection) {
            loadMoreMoviesSection()
          }
          break
        case "tvSection":
          if (hasMorePages.tvSection) {
            loadMoreTVSection()
          }
          break
        case "searchSection":
          if (hasMorePages.search && currentSearchQuery) {
            loadMoreSearchResults()
          }
          break
        case "genreSection":
          if (hasMorePages.genre && currentGenreId) {
            loadMoreGenreResults()
          }
          break
      }
    }
  })
}

// Load Initial Data
async function loadInitialData() {
  try {
    console.log("📥 Loading initial data...")
    await Promise.all([loadPopularMovies(), loadPopularTVShows(), loadTrendingMovies(), loadComedyMovies(), loadBengaliMovies()])
    console.log("✅ Initial data loaded successfully")
  } catch (error) {
    console.error("❌ Error loading initial data:", error)
  }
}

// Enhanced error display function
function showErrorState(container, message, retryFunction) {
  if (!container) return

  container.innerHTML = `
    <div class="col-12 text-center error-state">
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle mb-2"></i>
        <p class="mb-2">${message}</p>
        <button class="btn btn-primary btn-sm retry-button" onclick="${retryFunction}">
          <i class="fas fa-redo me-1"></i>Retry
        </button>
      </div>
    </div>
  `
}

// Load Trending Movies - COMPLETELY FIXED VERSION
async function loadTrendingMovies() {
  const container = document.getElementById("trendingMovies")
  if (!container) {
    console.error("❌ Trending movies container not found")
    return
  }

  try {
    console.log("🎬 Loading trending movies...")

    // Show loading state
    container.innerHTML = `
      <div class="col-12 text-center">
        <div class="loading">
          <div class="spinner"></div>
          <div>Loading trending movies...</div>
          <div class="small text-muted mt-1">This may take a moment on slower connections</div>
        </div>
      </div>
    `

    const endpoints = [
      { url: `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=tr-TR&page=1`, name: "trending weekly" },
      { url: `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=tr-TR&page=1`, name: "trending daily" },
      { url: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=tr-TR&page=1`, name: "popular movies" },
      { url: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=tr-TR&page=1`, name: "now playing" },
      { url: `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=tr-TR&page=1`, name: "top rated" },
    ]

    let data = null
    let endpoint = ""

    for (const endpointObj of endpoints) {
      try {
        console.log(`🔄 Trying ${endpointObj.name}...`)

        const response = await requestQueue.add(() => fetchWithRetry(endpointObj.url))

        const responseData = await response.json()
        if (responseData.results && responseData.results.length > 0) {
          data = responseData
          endpoint = endpointObj.name
          console.log(`✅ Successfully loaded from ${endpointObj.name}`)
          break
        }
      } catch (error) {
        console.warn(`⚠️ ${endpointObj.name} failed:`, error.message)
        continue
      }
    }

    if (data && data.results && data.results.length > 0) {
      const moviesToShow = data.results.slice(0, 8)
      displayMedia(moviesToShow, container, "movie")
      hasMorePages.trending = currentPages.trending < (data.total_pages || 1)
      console.log(`✅ Displayed ${moviesToShow.length} trending movies from ${endpoint}`)
    } else {
      console.log("🔄 Using fallback movie list...")
      const fallbackMovies = await loadFallbackMovies()
      if (fallbackMovies.length > 0) {
        displayMedia(fallbackMovies, container, "movie")
        console.log(`✅ Displayed ${fallbackMovies.length} fallback movies`)
      } else {
        showErrorState(
          container,
          "Unable to load trending movies. Please check your internet connection.",
          "loadTrendingMovies()",
        )
      }
    }
  } catch (error) {
    console.error("❌ Critical error loading trending movies:", error)
    showErrorState(container, "Failed to load trending movies. Please try again.", "loadTrendingMovies()")
  }
}

// Enhanced fallback function
async function loadFallbackMovies() {
  const popularMovieIds = [550, 680, 155, 13, 122, 27205, 278, 238]
  const fallbackMovies = []

  for (const movieId of popularMovieIds) {
    try {
      const response = await requestQueue.add(() =>
        fetchWithRetry(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=tr-TR`),
      )

      if (response.ok) {
        const movie = await response.json()
        fallbackMovies.push(movie)
      }

      // Limit concurrent requests for mobile
      if (isMobile && fallbackMovies.length >= 4) break
    } catch (error) {
      console.warn(`Failed to load movie ${movieId}:`, error)
    }
  }

  return fallbackMovies
}

// Load Comedy Movies with enhanced error handling
async function loadComedyMovies() {
  const container = document.getElementById("comedyMovies")
  if (!container) return

  try {
    console.log("😄 Loading comedy movies...")

    const response = await requestQueue.add(() =>
      fetchWithRetry(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35&sort_by=popularity.desc&page=${currentPages.comedy}`,
      ),
    )

    const data = await response.json()
    displayMedia(data.results.slice(0, 8), container, "movie")
    hasMorePages.comedy = currentPages.comedy < data.total_pages
    console.log("✅ Comedy movies loaded")
  } catch (error) {
    console.error("❌ Error loading comedy movies:", error)
    showErrorState(container, "Failed to load comedy movies.", "loadComedyMovies()")
  }
}

// Load Bengali Movies with enhanced error handling
async function loadBengaliMovies() {
  const container = document.getElementById("bengaliMovies")
  if (!container) return

  try {
    console.log("🇧🇩 Loading Bengali movies...")

    const response = await requestQueue.add(() =>
      fetchWithRetry(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=bn&sort_by=popularity.desc&page=${currentPages.bengali}`,
      ),
    )

    const data = await response.json()
    displayMedia(data.results.slice(0, 8), container, "movie")
    hasMorePages.bengali = currentPages.bengali < data.total_pages
    console.log("✅ Bengali movies loaded")
  } catch (error) {
    console.error("❌ Error loading Bengali movies:", error)
    showErrorState(container, "Failed to load Bengali movies.", "loadBengaliMovies()")
  }
}

// Load Popular Movies with enhanced error handling
async function loadPopularMovies() {
  const container = document.getElementById("popularMovies")
  if (!container) return

  try {
    console.log("🔥 Loading popular movies...")

    const response = await requestQueue.add(() =>
      fetchWithRetry(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=tr-TR&page=${currentPages.popularMovies}`),
    )

    const data = await response.json()
    displayMedia(data.results, container, "movie")
    hasMorePages.popularMovies = currentPages.popularMovies < data.total_pages
    console.log("✅ Popular movies loaded")
  } catch (error) {
    console.error("❌ Error loading popular movies:", error)
    showErrorState(container, "Failed to load popular movies.", "loadPopularMovies()")
  }
}

// Load More Popular Movies
async function loadMorePopularMovies() {
  if (isLoading || !hasMorePages.popularMovies) return

  isLoading = true
  const loadingElement = document.getElementById("moviesInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.popularMovies++
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=tr-TR&page=${currentPages.popularMovies}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("popularMovies"), "movie")
    hasMorePages.popularMovies = currentPages.popularMovies < data.total_pages
  } catch (error) {
    console.error("❌ Error loading more popular movies:", error)
    currentPages.popularMovies--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Load Popular TV Shows
async function loadPopularTVShows() {
  const container = document.getElementById("popularTVShows")
  if (!container) return

  try {
    console.log("📺 Loading popular TV shows...")
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.popularTVShows}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    displayMedia(data.results, container, "tv")
    hasMorePages.popularTVShows = currentPages.popularTVShows < data.total_pages
    console.log("✅ Popular TV shows loaded")
  } catch (error) {
    console.error("❌ Error loading popular TV shows:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading TV shows.</p></div>'
  }
}

// Load More Popular TV Shows
async function loadMorePopularTVShows() {
  if (isLoading || !hasMorePages.popularTVShows) return

  isLoading = true
  const loadingElement = document.getElementById("tvInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.popularTVShows++
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.popularTVShows}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("popularTVShows"), "tv")
    hasMorePages.popularTVShows = currentPages.popularTVShows < data.total_pages
  } catch (error) {
    console.error("❌ Error loading more popular TV shows:", error)
    currentPages.popularTVShows--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Load Movies Section
async function loadMoviesSection() {
  const container = document.getElementById("moviesGrid")
  if (!container) return

  // Only show loading if it's the first load
  if (currentPages.moviesSection === 1) {
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Filmler yükleniyor...</div>'
  }

  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.moviesSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    displayMedia(data.results, container, "movie")
    hasMorePages.moviesSection = currentPages.moviesSection < data.total_pages
    console.log("✅ Movies section loaded")
    // Update load-more button visibility (if present)
    try { updateLoadMoreButtons() } catch (e) { /* ignore */ }
  } catch (error) {
    console.error("❌ Error loading movies section:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading movies.</p></div>'
  }
}

// Load More Movies Section
async function loadMoreMoviesSection() {
  if (isLoading || !hasMorePages.moviesSection) return

  isLoading = true
  const loadingElement = document.getElementById("moviesSectionInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.moviesSection++
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.moviesSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("moviesGrid"), "movie")
    hasMorePages.moviesSection = currentPages.moviesSection < data.total_pages
    try { updateLoadMoreButtons() } catch (e) { }
  } catch (error) {
    console.error("❌ Error loading more movies:", error)
    currentPages.moviesSection--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Load TV Section
async function loadTVSection() {
  const container = document.getElementById("tvGrid")
  if (!container) return

  // Only show loading if it's the first load
  if (currentPages.tvSection === 1) {
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Diziler yükleniyor...</div>'
  }

  try {
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.tvSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    displayMedia(data.results, container, "tv")
    hasMorePages.tvSection = currentPages.tvSection < data.total_pages
    console.log("✅ TV section loaded")
    try { updateLoadMoreButtons() } catch (e) { }
  } catch (error) {
    console.error("❌ Error loading TV section:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading TV shows.</p></div>'
  }
}

// Load More TV Section
async function loadMoreTVSection() {
  if (isLoading || !hasMorePages.tvSection) return

  isLoading = true
  const loadingElement = document.getElementById("tvSectionInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.tvSection++
    const response = await fetch(
      `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US&page=${currentPages.tvSection}`,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    appendMedia(data.results, document.getElementById("tvGrid"), "tv")
    hasMorePages.tvSection = currentPages.tvSection < data.total_pages
    try { updateLoadMoreButtons() } catch (e) { }
  } catch (error) {
    console.error("❌ Error loading more TV shows:", error)
    currentPages.tvSection--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Perform Search - MANUAL SEARCH ONLY
async function performSearch() {
  if (!searchInput) return

  const query = searchInput.value.trim()
  if (!query || query.length < MIN_SEARCH_LENGTH) {
    alert(`Please enter at least ${MIN_SEARCH_LENGTH} characters to search.`)
    return
  }

  console.log("🔍 Manual search initiated for:", query)
  currentSearchQuery = query
  currentPages.search = 1
  hasMorePages.search = true

  showSection("search")
  const searchTitle = document.getElementById("searchTitle")
  if (searchTitle) {
    searchTitle.textContent = `Search Results for "${query}"`
  }

  const container = document.getElementById("searchResults")
  if (!container) return

  container.innerHTML = '<div class="loading"><div class="spinner"></div>Searching...</div>'

  try {
    // Use Promise.allSettled for better error handling
    const [movieResult, tvResult] = await Promise.allSettled([
      fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}&page=${currentPages.search}`,
      ),
      fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(query)}&page=${currentPages.search}`,
      ),
    ])

    let movieData = { results: [], total_pages: 0 }
    let tvData = { results: [], total_pages: 0 }

    // Handle movie search results
    if (movieResult.status === "fulfilled" && movieResult.value.ok) {
      movieData = await movieResult.value.json()
    } else {
      console.warn("⚠️ Movie search failed:", movieResult.reason)
    }

    // Handle TV search results
    if (tvResult.status === "fulfilled" && tvResult.value.ok) {
      tvData = await tvResult.value.json()
    } else {
      console.warn("⚠️ TV search failed:", tvResult.reason)
    }

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length === 0) {
      container.innerHTML =
        '<div class="col-12 text-center"><p>No results found for your search. Try different keywords.</p></div>'
      hasMorePages.search = false
    } else {
      displayMedia(combinedResults, container, "mixed")
      hasMorePages.search = currentPages.search < Math.max(movieData.total_pages, tvData.total_pages)
      console.log(`✅ Search completed. Found ${combinedResults.length} results`)
    }
  } catch (error) {
    console.error("❌ Search error:", error)
    container.innerHTML =
      '<div class="col-12 text-center"><p>Search failed. Please check your connection and try again.</p></div>'
  }
}

// Load More Search Results
async function loadMoreSearchResults() {
  if (isLoading || !hasMorePages.search || !currentSearchQuery) return

  isLoading = true
  const loadingElement = document.getElementById("searchInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.search++
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(currentSearchQuery)}&page=${currentPages.search}`,
      ),
      fetch(
        `${BASE_URL}/search/tv?api_key=${API_KEY}&language=tr-TR&query=${encodeURIComponent(currentSearchQuery)}&page=${currentPages.search}`,
      ),
    ])

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Search request failed")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length > 0) {
      appendMedia(combinedResults, document.getElementById("searchResults"), "mixed")
    }

    hasMorePages.search = currentPages.search < Math.max(movieData.total_pages, tvData.total_pages)
  } catch (error) {
    console.error("❌ Error loading more search results:", error)
    currentPages.search--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Filter by Genre
async function filterByGenre(genreId, genreName) {
  currentGenreId = genreId
  currentGenreName = genreName
  currentPages.genre = 1
  hasMorePages.genre = true

  showSection("genre")
  const genreTitle = document.getElementById("genreTitle")
  if (genreTitle) {
    genreTitle.textContent = `${genreName} Movies & TV Shows`
  }

  const container = document.getElementById("genreResults")
  if (!container) return

  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>'

  try {
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
      fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
    ])

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Genre filter request failed")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p>No content found for this genre.</p></div>'
      hasMorePages.genre = false
    } else {
      displayMedia(combinedResults, container, "mixed")
      hasMorePages.genre = currentPages.genre < Math.max(movieData.total_pages, tvData.total_pages)
    }
  } catch (error) {
    console.error("❌ Error filtering by genre:", error)
    container.innerHTML = '<div class="col-12 text-center"><p>Error loading content. Please try again later.</p></div>'
  }
}

// Load More Genre Results
async function loadMoreGenreResults() {
  if (isLoading || !hasMorePages.genre || !currentGenreId) return

  isLoading = true
  const loadingElement = document.getElementById("genreInfiniteLoading")
  if (loadingElement) loadingElement.classList.add("show")

  try {
    currentPages.genre++
    const [movieResponse, tvResponse] = await Promise.all([
      fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${currentGenreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
      fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${currentGenreId}&sort_by=popularity.desc&page=${currentPages.genre}`,
      ),
    ])

    if (!movieResponse.ok || !tvResponse.ok) {
      throw new Error("Genre filter request failed")
    }

    const movieData = await movieResponse.json()
    const tvData = await tvResponse.json()

    const combinedResults = [
      ...movieData.results.map((item) => ({ ...item, media_type: "movie" })),
      ...tvData.results.map((item) => ({ ...item, media_type: "tv" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

    if (combinedResults.length > 0) {
      appendMedia(combinedResults, document.getElementById("genreResults"), "mixed")
    }

    hasMorePages.genre = currentPages.genre < Math.max(movieData.total_pages, tvData.total_pages)
  } catch (error) {
    console.error("❌ Error loading more genre results:", error)
    currentPages.genre--
  } finally {
    isLoading = false
    if (loadingElement) loadingElement.classList.remove("show")
  }
}

// Display Media - IMPROVED VERSION
function displayMedia(mediaList, container, type) {
  if (!container || !mediaList) {
    console.error("❌ Invalid container or media list")
    return
  }

  try {
    if (mediaList.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No content available.</p></div>'
      return
    }

    const mediaHTML = mediaList.map((media) => createMediaHTML(media, type)).join("")
    container.innerHTML = mediaHTML
    console.log(`✅ Displayed ${mediaList.length} media items`)
  } catch (error) {
    console.error("❌ Error displaying media:", error)
    container.innerHTML = '<div class="col-12 text-center"><p class="text-danger">Error displaying content.</p></div>'
  }
}

// Append Media (for infinite scroll)
function appendMedia(mediaList, container, type) {
  if (!container || !mediaList) return

  try {
    const mediaHTML = mediaList.map((media) => createMediaHTML(media, type)).join("")
    container.insertAdjacentHTML("beforeend", mediaHTML)
    console.log(`✅ Appended ${mediaList.length} more media items`)
  } catch (error) {
    console.error("❌ Error appending media:", error)
  }
}

// Create Media HTML - IMPROVED VERSION
function createMediaHTML(media, type) {
  try {
    const posterUrl = media.poster_path
      ? `${IMAGE_BASE_URL}${media.poster_path}`
      : "/placeholder.svg?height=450&width=300"

    const rating = media.vote_average ? media.vote_average.toFixed(1) : "N/A"
    const title = media.title || media.name || "Unknown Title"
    const releaseDate = media.release_date || media.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "Unknown"
    const mediaType = media.media_type || type

    return `
      <div class="movie-card" onclick="goToDetailPage(${media.id}, '${mediaType}')">
        <div class="media-poster-container">
          <img src="${posterUrl}"
               alt="${title}"
               class="media-poster"
               loading="lazy"
               onerror="this.src='/placeholder.svg?height=450&width=300'; this.onerror=null;">
          <div class="media-overlay">
            <i class="fas fa-play play-icon"></i>
          </div>
          ${type === "mixed" ? `<span class="media-type-badge">${mediaType.toUpperCase()}</span>` : ""}
        </div>
        <div class="media-info">
          <h3 class="media-title">${title}</h3>
          <div class="media-rating">
            <div class="rating-stars">
              <i class="fas fa-star"></i>
              <span>${rating}</span>
            </div>
            <span class="media-year">${year}</span>
          </div>
        </div>
      </div>
    `
  } catch (error) {
    console.error("❌ Error creating media HTML:", error)
    return '<div class="movie-card error">Error loading content</div>'
  }
}

// Show Media Details
function showMediaDetails(mediaId, mediaType) {
  goToDetailPage(mediaId, mediaType)
}

// Load Episodes for TV Show
async function loadEpisodes(tvId, seasonNumber) {
  try {
    console.log(`📺 Loading episodes for TV ${tvId}, Season ${seasonNumber}`)

    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=tr-TR`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const seasonData = await response.json()
    const episodesList = document.getElementById("episodesList")
    if (!episodesList) return

    if (seasonData.episodes && seasonData.episodes.length > 0) {
      const episodesHTML = seasonData.episodes
        .map(
          (episode) => `
                <div class="episode-card" onclick="playMedia(${tvId}, 'tv', ${seasonNumber}, ${episode.episode_number})">
                    <h6>Episode ${episode.episode_number}: ${episode.name}</h6>
                    <p class="small text-muted">${episode.overview ? episode.overview.substring(0, 100) + "..." : "No description available"}</p>
                    <div class="small">
                        <i class="fas fa-calendar me-1"></i>${episode.air_date || "TBA"}
                        ${episode.runtime ? `<span class="ms-2"><i class="fas fa-clock me-1"></i>${episode.runtime} min</span>` : ""}
                    </div>
                </div>
            `,
        )
        .join("")

      episodesList.innerHTML = `
                <h6 class="mt-3 mb-3">Episodes:</h6>
                <div class="episode-grid">${episodesHTML}</div>
            `

      console.log(`✅ Loaded ${seasonData.episodes.length} episodes`)
    } else {
      episodesList.innerHTML = '<p class="text-muted">No episodes available for this season.</p>'
    }
  } catch (error) {
    console.error("❌ Error loading episodes:", error)
    const episodesList = document.getElementById("episodesList")
    if (episodesList) {
      episodesList.innerHTML = '<p class="text-muted">Error loading episodes.</p>'
    }
  }
}

// Play Media using Vidsrc
function playMedia(mediaId, mediaType, season = null, episode = null) {
  let vidsrcUrl = ""
  let playerTitle = ""

  // Helper function to save watch history to localStorage
  function saveWatchHistory(entry) {
    try {
      const WATCH_HISTORY_KEY = "watchHistory"
      let history = JSON.parse(localStorage.getItem(WATCH_HISTORY_KEY)) || { movies: [], tvShows: [] }

      if (entry.mediaType === "movie") {
        // Check if movie already exists in history
        const existingIndex = history.movies.findIndex(m => m.id === entry.id)
        if (existingIndex !== -1) {
          // Update watchedAt if newer
          if (new Date(entry.watchedAt) > new Date(history.movies[existingIndex].watchedAt)) {
            history.movies[existingIndex] = entry
          }
        } else {
          history.movies.push(entry)
        }
      } else if (entry.mediaType === "tv") {
        // TV shows stored as array of shows with seasons and episodes
        const showIndex = history.tvShows.findIndex(s => s.id === entry.id)
        if (showIndex === -1) {
          // New show entry
          history.tvShows.push({
            id: entry.id,
            title: entry.title,
            poster: entry.poster,
            seasons: {
              [entry.season]: {
                episode: entry.episode,
                episodeTitle: entry.episodeTitle,
                watchedAt: entry.watchedAt
              }
            }
          })
        } else {
          // Existing show, update seasons
          const show = history.tvShows[showIndex]
          if (!show.seasons[entry.season]) {
            show.seasons[entry.season] = {
              episode: entry.episode,
              episodeTitle: entry.episodeTitle,
              watchedAt: entry.watchedAt
            }
          } else {
            // Update if this watchedAt is newer
            if (new Date(entry.watchedAt) > new Date(show.seasons[entry.season].watchedAt)) {
              show.seasons[entry.season] = {
                episode: entry.episode,
                episodeTitle: entry.episodeTitle,
                watchedAt: entry.watchedAt
              }
            }
          }
          history.tvShows[showIndex] = show
        }
      }

      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history))
    } catch (error) {
      console.error("❌ Watch history save error:", error)
    }
  }

  if (mediaType === "movie") {
    vidsrcUrl = `${VIDSRC_BASE_URL}/v2/embed/movie/${mediaId}`
    playerTitle = `Playing: ${currentMedia.title || "Movie"}`
    currentSeason = null
    currentEpisode = null

    // Save movie watch history
    saveWatchHistory({
      id: mediaId,
      title: currentMedia.title || "",
      poster: currentMedia.poster_path ? `${IMAGE_BASE_URL}${currentMedia.poster_path}` : "",
      mediaType: "movie",
      watchedAt: new Date().toISOString()
    })

  } else if (mediaType === "tv" && season !== null && episode !== null) {
    vidsrcUrl = `${VIDSRC_BASE_URL}/v2/embed/tv/${mediaId}/${season}/${episode}`
    playerTitle = `Playing: ${currentMedia.name || "TV Show"} - S${season}E${episode}`
    currentSeason = season
    currentEpisode = episode

    // Save TV episode watch history
    saveWatchHistory({
      id: mediaId,
      title: currentMedia.name || "",
      poster: currentMedia.poster_path ? `${IMAGE_BASE_URL}${currentMedia.poster_path}` : "",
      season: season,
      episode: episode,
      episodeTitle: currentMedia.overview || "",
      mediaType: "tv",
      watchedAt: new Date().toISOString(),
    })
  }

  if (vidsrcUrl) {
    const playerTitleElement = document.getElementById("playerTitle")
    const playerContent = document.getElementById("playerContent")
    const nextEpisodeBtn = document.getElementById("nextEpisodeBtn")

    // Show loading state
    if (playerContent) {
      playerContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: #fff; height: 100%;">
          <div style="width: 50px; height: 50px; border: 4px solid #333; border-top: 4px solid #e50914; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <span>Video yükleniyor...</span>
        </div>
      `
    }

    // Create iframe dynamically
    const playerIframe = document.createElement("iframe")
    playerIframe.id = "playerIframe"
    playerIframe.src = vidsrcUrl
    playerIframe.style.width = "100%"
    playerIframe.style.height = "100%"
    playerIframe.style.border = "none"
    playerIframe.allowFullscreen = true
    playerIframe.allow = "autoplay; encrypted-media"

    // Append iframe immediately without waiting for load
    if (playerContent) {
      playerContent.innerHTML = ""
      playerContent.appendChild(playerIframe)
    }

    if (playerTitleElement) playerTitleElement.textContent = playerTitle

    // Show/hide episode navigation buttons for TV shows
    const previousEpisodeBtn = document.getElementById("previousEpisodeBtn")
    if (nextEpisodeBtn) {
      if (mediaType === "tv" && season !== null && episode !== null) {
        nextEpisodeBtn.style.display = "inline-flex"
        if (previousEpisodeBtn) previousEpisodeBtn.style.display = "inline-flex"
      } else {
        nextEpisodeBtn.style.display = "none"
        if (previousEpisodeBtn) previousEpisodeBtn.style.display = "none"
      }
    }

    mediaModal.hide()
    playerModal.show()

    console.log("▶️ Playing media:", playerTitle)
  }
}

// Go back from player to media details
function goBack() {
  playerModal.hide()
  setTimeout(() => {
    mediaModal.show()
  }, 300) // Small delay to ensure smooth transition
}

// Play previous episode for TV shows
function previousEpisode() {
  if (!currentMedia || currentMedia.media_type !== "tv" || !currentSeason || !currentEpisode) return

  // Get previous episode info
  const prevEpisodeNum = currentEpisode - 1
  let prevSeasonNum = currentSeason

  // Check if we need to go to previous season
  if (prevEpisodeNum < 1) {
    prevSeasonNum = currentSeason - 1
    // Check if previous season exists
    const prevSeasonData = currentSeasons.find(s => s.season_number === prevSeasonNum)
    if (!prevSeasonData) {
      alert("İlk bölüm oynatılıyor")
      return
    }
    // Go to last episode of previous season
    playMedia(currentMedia.id, "tv", prevSeasonNum, prevSeasonData.episode_count)
  } else {
    playMedia(currentMedia.id, "tv", prevSeasonNum, prevEpisodeNum)
  }
}

// Play next episode for TV shows
function nextEpisode() {
  if (!currentMedia || currentMedia.media_type !== "tv" || !currentSeason || !currentEpisode) return

  // Get next episode info
  const nextEpisodeNum = currentEpisode + 1
  let nextSeasonNum = currentSeason

  // Check if we need to go to next season
  const currentSeasonData = currentSeasons.find(s => s.season_number === currentSeason)
  if (currentSeasonData && nextEpisodeNum > currentSeasonData.episode_count) {
    nextSeasonNum = currentSeason + 1
    // Check if next season exists
    const nextSeasonData = currentSeasons.find(s => s.season_number === nextSeasonNum)
    if (!nextSeasonData) {
      alert("Son bölüm oynatılıyor")
      return
    }
    playMedia(currentMedia.id, "tv", nextSeasonNum, 1)
  } else {
    playMedia(currentMedia.id, "tv", nextSeasonNum, nextEpisodeNum)
  }
}

// Show Actor Details
async function showActorDetails(actorId) {
  try {
    console.log(`🎭 Loading details for actor ID: ${actorId}`)

    // Fetch actor details and credits
    const [actorResponse, creditsResponse] = await Promise.all([
      fetch(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=tr-TR`),
      fetch(`${BASE_URL}/person/${actorId}/combined_credits?api_key=${API_KEY}&language=tr-TR`)
    ])

    if (!actorResponse.ok || !creditsResponse.ok) {
      throw new Error(`HTTP error! status: ${actorResponse.status} or ${creditsResponse.status}`)
    }

    const actor = await actorResponse.json()
    const credits = await creditsResponse.json()

    // Separate movies and TV shows
    const movies = credits.cast.filter(item => item.media_type === 'movie').slice(0, 10)
    const tvShows = credits.cast.filter(item => item.media_type === 'tv').slice(0, 10)

    const profileUrl = actor.profile_path
      ? `${IMAGE_BASE_URL}${actor.profile_path}`
      : "/placeholder.svg?height=300&width=200"

    const birthDate = actor.birthday ? new Date(actor.birthday).toLocaleDateString('tr-TR') : 'Bilinmiyor'
    const deathDate = actor.deathday ? new Date(actor.deathday).toLocaleDateString('tr-TR') : null
    const age = actor.birthday ? (deathDate ? 
      Math.floor((new Date(actor.deathday) - new Date(actor.birthday)) / (365.25 * 24 * 60 * 60 * 1000)) :
      Math.floor((new Date() - new Date(actor.birthday)) / (365.25 * 24 * 60 * 60 * 1000))) : 'Bilinmiyor'

    let moviesSection = ""
    if (movies.length > 0) {
      moviesSection = `
        <div class="actors-section mt-4">
          <h5><i class="fas fa-film me-2"></i>Oynadığı Filmler</h5>
          <div class="actors-grid">
            ${movies.map(movie => {
              const posterUrl = movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : "/placeholder.svg?height=200&width=150"
              const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Bilinmiyor'
              return `
                <div class="actor-item" onclick="goToDetailPage(${movie.id}, 'movie')">
                  <div class="actor-image-container">
                    <img src="${posterUrl}" alt="${movie.title}" class="actor-image" onerror="this.src='/placeholder.svg?height=200&width=150'">
                  </div>
                  <div class="actor-name">${movie.title}</div>
                  <div class="small text-muted">${year}</div>
                </div>
              `
            }).join("")}
          </div>
        </div>
      `
    }

    let tvShowsSection = ""
    if (tvShows.length > 0) {
      tvShowsSection = `
        <div class="actors-section mt-4">
          <h5><i class="fas fa-tv me-2"></i>Oynadığı Diziler</h5>
          <div class="actors-grid">
            ${tvShows.map(show => {
              const posterUrl = show.poster_path
                ? `${IMAGE_BASE_URL}${show.poster_path}`
                : "/placeholder.svg?height=200&width=150"
              const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Bilinmiyor'
              return `
                <div class="actor-item" onclick="goToDetailPage(${show.id}, 'tv')">
                  <div class="actor-image-container">
                    <img src="${posterUrl}" alt="${show.name}" class="actor-image" onerror="this.src='/placeholder.svg?height=200&width=150'">
                  </div>
                  <div class="actor-name">${show.name}</div>
                  <div class="small text-muted">${year}</div>
                </div>
              `
            }).join("")}
          </div>
        </div>
      `
    }

    const modalContent = `
      <button class="btn btn-secondary mb-3" onclick="showMediaDetails(${currentMedia.id}, '${currentMedia.media_type}')">
        <i class="fas fa-arrow-left me-2"></i>Geri
      </button>
      <div class="row">
        <div class="col-md-4">
          <img src="${profileUrl}" alt="${actor.name}" class="img-fluid rounded" style="max-width: 100%; height: auto;" onerror="this.src='/placeholder.svg?height=300&width=200'">
        </div>
        <div class="col-md-8">
          <h4>${actor.name}</h4>
          <div class="mb-3">
            <p><strong>Doğum Tarihi:</strong> ${birthDate}</p>
            ${deathDate ? `<p><strong>Ölüm Tarihi:</strong> ${deathDate}</p>` : ''}
            <p><strong>Yaş:</strong> ${age}</p>
            ${actor.place_of_birth ? `<p><strong>Doğum Yeri:</strong> ${actor.place_of_birth}</p>` : ''}
          </div>
          ${actor.biography ? `<p><strong>Biyografi:</strong> ${actor.biography}</p>` : '<p>Biyografi bulunamadı.</p>'}
        </div>
      </div>
      ${moviesSection}
      ${tvShowsSection}
    `

    const modalTitle = document.getElementById("modalTitle")
    const modalBody = document.getElementById("modalBody")

    if (modalTitle) modalTitle.textContent = actor.name
    if (modalBody) modalBody.innerHTML = modalContent

    mediaModal.show()

    console.log("✅ Actor details loaded successfully")
  } catch (error) {
    console.error("❌ Error loading actor details:", error)
    alert("Aktör detayları yüklenirken hata oluştu. Tekrar deneyin.")
  }
}

// Disable right-click context menu
document.addEventListener("contextmenu", (e) => {
  e.preventDefault()
  alert("Bro its piyush website, right click is disabled.")
})

// Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener("keydown", (e) => {
  // F12
  if (e.key === "F12") {
    e.preventDefault()
    alert("Inspect Element is disabled on this page.")
    return false
  }
  // Ctrl+Shift+I or Ctrl+Shift+J
  if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "i" || e.key === "j")) {
    e.preventDefault()
    alert("Inspect Element is disabled on this page.")
    return false
  }
  // Ctrl+U
  if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
    e.preventDefault()
    alert("View Source is disabled on this page.")
    return false
  }
})