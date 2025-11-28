// Detail page JavaScript
const API_KEY = "999a2c8d29cd1833fa98446f909f19eb"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"
const VIDSRC_BASE_URL = "https://vidsrc.cc"

// Global variables
let currentMedia = null
let currentSeasons = []
let currentSeason = null
let currentEpisode = null
let movieTrailers = []

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initialize detail page
document.addEventListener("DOMContentLoaded", async () => {
    const mediaId = getUrlParameter('id')
    const mediaType = getUrlParameter('type')

    if (!mediaId || !mediaType) {
        showError("Geçersiz içerik ID'si veya türü")
        return
    }

    try {
        await loadMediaDetails(mediaId, mediaType)
    } catch (error) {
        console.error("Error loading media details:", error)
        showError("İçerik detayları yüklenirken hata oluştu")
    }
})

// Load media details
async function loadMediaDetails(mediaId, mediaType) {
    try {
        console.log(`Loading details for ${mediaType} ID: ${mediaId}`)

        const endpoint = mediaType === "movie" ? "movie" : "tv"
        const response = await fetch(
            `${BASE_URL}/${endpoint}/${mediaId}?api_key=${API_KEY}&language=tr-TR&append_to_response=credits,recommendations,external_ids`
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const media = await response.json()
        currentMedia = { ...media, media_type: mediaType }

        displayMediaDetails(media, mediaType)

        if (mediaType === "tv") {
            currentSeasons = media.seasons || []
            loadSeasons(mediaId)
        }

        console.log("Media details loaded successfully")
    } catch (error) {
        console.error("Error loading media details:", error)
        showError("Detaylar yüklenirken hata oluştu")
    }
}

// Display media details
function displayMediaDetails(media, mediaType) {
    // Set hero background
    const backdropUrl = media.backdrop_path
        ? `${BACKDROP_BASE_URL}${media.backdrop_path}`
        : "/placeholder.svg?height=600&width=1200"

    document.getElementById("detailHero").style.backgroundImage = `url('${backdropUrl}')`

    // Set poster
    const posterUrl = media.poster_path
        ? `${IMAGE_BASE_URL}${media.poster_path}`
        : "/placeholder.svg?height=300&width=200"

    document.getElementById("detailPoster").src = posterUrl
    document.getElementById("detailPoster").alt = media.title || media.name

    // Set title
    const title = media.title || media.name
    document.getElementById("detailTitle").textContent = title
    document.title = `${title} - Dizicom`

    // Set rating
    const rating = media.vote_average ? media.vote_average.toFixed(1) : "N/A"
    document.getElementById("detailRating").textContent = rating

    // Set year
    const releaseDate = media.release_date || media.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "Bilinmiyor"
    document.getElementById("detailYear").textContent = year

    // Set runtime or seasons
    if (mediaType === "movie") {
        if (media.runtime) {
            document.getElementById("detailRuntime").textContent = `${media.runtime} dk`
        } else {
            document.getElementById("runtimeMeta").style.display = "none"
        }
        document.getElementById("seasonsMeta").style.display = "none"
    } else {
        document.getElementById("runtimeMeta").style.display = "none"
        if (media.number_of_seasons) {
            document.getElementById("detailSeasons").textContent = `${media.number_of_seasons} sezon`
            document.getElementById("seasonsMeta").style.display = "flex"
        }
    }

    // Set genres
    const genreTags = document.getElementById("genreTags")
    if (media.genres && media.genres.length > 0) {
        genreTags.innerHTML = media.genres.map(genre =>
            `<span class="genre-tag">${genre.name}</span>`
        ).join("")
    } else {
        genreTags.innerHTML = ""
    }

    // Set overview
    const overviewElement = document.getElementById("detailOverview")
    const seeMoreBtn = document.getElementById("seeMoreBtn")
    const overviewText = media.overview || "Özet bulunamadı."

    overviewElement.textContent = overviewText

    // Check if overview is long enough to need "see more" button
    if (overviewText.length > 150) {
        seeMoreBtn.style.display = "inline-block"
        seeMoreBtn.textContent = "Devamını Gör"
        seeMoreBtn.onclick = function() {
            if (overviewElement.classList.contains("expanded")) {
                overviewElement.classList.remove("expanded")
                seeMoreBtn.textContent = "Devamını Gör"
            } else {
                overviewElement.classList.add("expanded")
                seeMoreBtn.textContent = "Küçült"
            }
        }
    } else {
        seeMoreBtn.style.display = "none"
    }

    // Load cast
    loadCast(media.credits)

    // Load recommendations
    loadRecommendations(media.recommendations, mediaType)

    // Setup watch button
    const watchBtn = document.getElementById("watchBtn")
    const trailerBtn = document.getElementById("trailerBtn")
    if (mediaType === "movie") {
        watchBtn.onclick = () => playMedia(media.id, 'movie')
        // Always show trailer button for movies, fetch trailers
        trailerBtn.style.display = "inline-block"
        fetchMovieTrailers(media.id).then(trailers => {
            movieTrailers = trailers
            if (trailers.length > 0) {
                trailerBtn.onclick = () => playTrailer(trailers[0])
                trailerBtn.style.opacity = "1"
            } else {
                trailerBtn.onclick = () => alert("Bu film için fragman bulunamadı.")
                trailerBtn.style.opacity = "0.5"
            }
        })
    } else {
        watchBtn.onclick = () => showEpisodesSection()
    }
}

// Load cast
function loadCast(credits) {
    const castGrid = document.getElementById("castGrid")

    if (!credits || !credits.cast || credits.cast.length === 0) {
        castGrid.innerHTML = '<p class="text-muted">Oyuncu bilgileri bulunamadı.</p>'
        return
    }

    const cast = credits.cast.slice(0, 12) // Show up to 12 actors
    castGrid.innerHTML = cast.map(actor => {
        const profileUrl = actor.profile_path
            ? `${IMAGE_BASE_URL}${actor.profile_path}`
            : "/placeholder.svg?height=120&width=120"

        return `
            <div class="actor-item" onclick="showActorDetails(${actor.id})">
                <div class="actor-image-container">
                    <img src="${profileUrl}" alt="${actor.name}" class="actor-image" onerror="this.src='/placeholder.svg?height=120&width=120'">
                </div>
                <div class="actor-name">${actor.name}</div>
            </div>
        `
    }).join("")
}

// Load recommendations
function loadRecommendations(recommendations, mediaType) {
    const recGrid = document.getElementById("recommendationsGrid")

    if (!recommendations || !recommendations.results || recommendations.results.length === 0) {
        recGrid.innerHTML = '<p class="text-muted">Öneri bulunamadı.</p>'
        return
    }

    const recs = recommendations.results.slice(0, 8)
    recGrid.innerHTML = recs.map(rec => {
        const posterUrl = rec.poster_path
            ? `${IMAGE_BASE_URL}${rec.poster_path}`
            : "/placeholder.svg?height=250&width=180"

        const title = rec.title || rec.name
        const year = (rec.release_date || rec.first_air_date)
            ? new Date(rec.release_date || rec.first_air_date).getFullYear()
            : "Bilinmiyor"

        return `
            <div class="recommendation-item" onclick="goToDetail(${rec.id}, '${mediaType}')">
                <img src="${posterUrl}" alt="${title}" onerror="this.src='/placeholder.svg?height=250&width=180'">
                <div class="rec-info">
                    <div class="rec-title">${title}</div>
                    <div class="rec-meta">${year}</div>
                </div>
            </div>
        `
    }).join("")
}

// Load seasons for TV shows
function loadSeasons(tvId) {
    if (!currentSeasons || currentSeasons.length === 0) {
        document.getElementById("episodesSection").style.display = "none"
        return
    }

    document.getElementById("episodesSection").style.display = "block"

    const seasonButtons = document.getElementById("seasonButtons")
    let buttonsHTML = currentSeasons
        .filter(season => season.season_number > 0)
        .map(season => `
            <button class="season-btn" onclick="loadEpisodes(${tvId}, ${season.season_number})">
                Sezon ${season.season_number}
            </button>
        `).join("")

    // Add Fragmanlar button
    buttonsHTML += `<button class="season-btn" onclick="showTVTrailers(${tvId})" style="background: rgba(229,9,20,0.2); color: #e50914; border-color: rgba(229,9,20,0.3);">
        <i class="fas fa-film"></i> Fragmanlar
    </button>`

    seasonButtons.innerHTML = buttonsHTML

    // Load first season by default
    const firstSeason = currentSeasons.find(s => s.season_number > 0)
    if (firstSeason) {
        loadEpisodes(tvId, firstSeason.season_number)
    }
}

// Load episodes for a season
async function loadEpisodes(tvId, seasonNumber) {
    try {
        console.log(`Loading episodes for TV ${tvId}, Season ${seasonNumber}`)

        // Update active season button
        const seasonBtns = document.querySelectorAll(".season-btn")
        seasonBtns.forEach(btn => btn.classList.remove("active"))
        if (event && event.target) {
            event.target.classList.add("active")
        } else {
            // If called programmatically, find and activate the correct button
            const targetBtn = document.querySelector(`.season-btn[onclick*="loadEpisodes(${tvId}, ${seasonNumber})"]`)
            if (targetBtn) {
                targetBtn.classList.add("active")
            }
        }

        const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=tr-TR`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const seasonData = await response.json()
        currentSeason = seasonNumber

        const episodesGrid = document.getElementById("episodesGrid")
        if (seasonData.episodes && seasonData.episodes.length > 0) {
            episodesGrid.innerHTML = seasonData.episodes.map(episode => {
                const posterUrl = episode.still_path
                    ? `${IMAGE_BASE_URL}${episode.still_path}`
                    : "/placeholder.svg?height=140&width=250"

                return `
                    <div class="episode-card" onclick="playEpisode(${tvId}, ${seasonNumber}, ${episode.episode_number})">
                        <img src="${posterUrl}" alt="Episode ${episode.episode_number}" class="episode-poster" onerror="this.src='/placeholder.svg?height=140&width=250'">
                        <div class="episode-info">
                            <div class="episode-number">Bölüm ${episode.episode_number}</div>
                            <div class="episode-title">${episode.name}</div>
                            <div class="episode-overview">${episode.overview || "Açıklama bulunamadı."}</div>
                        </div>
                    </div>
                `
            }).join("")
        } else {
            episodesGrid.innerHTML = '<p class="text-muted">Bu sezonda bölüm bulunamadı.</p>'
        }

        console.log(`Loaded ${seasonData.episodes?.length || 0} episodes`)
    } catch (error) {
        console.error("Error loading episodes:", error)
        document.getElementById("episodesGrid").innerHTML = '<p class="text-muted">Bölümler yüklenirken hata oluştu.</p>'
    }
}

// Show episodes section and scroll to it
function showEpisodesSection() {
    document.getElementById("episodesSection").scrollIntoView({ behavior: "smooth" })
}

// Play media
function playMedia(mediaId, mediaType, season = null, episode = null) {
    let searchQuery = ""
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
        const title = currentMedia.title || "Film"
        searchQuery = `${title} izle full hd türkçe dublaj`
        playerTitle = title
        currentSeason = null
        currentEpisode = null

        // Save movie watch history
        saveWatchHistory({
            id: mediaId,
            title: currentMedia.title || "",
            poster: currentMedia.poster_path ? `https://image.tmdb.org/t/p/w500${currentMedia.poster_path}` : "",
            mediaType: "movie",
            watchedAt: new Date().toISOString()
        })

    } else if (mediaType === "tv" && season !== null && episode !== null) {
        const title = currentMedia.name || "Dizi"
        searchQuery = `${title} sezon ${season} bölüm ${episode} izle full hd türkçe dublaj`
        playerTitle = `${title} - S${season}E${episode}`
        currentSeason = season
        currentEpisode = episode

        // Save TV episode watch history
        saveWatchHistory({
            id: mediaId,
            title: currentMedia.name || "",
            poster: currentMedia.poster_path ? `https://image.tmdb.org/t/p/w500${currentMedia.poster_path}` : "",
            season: season,
            episode: episode,
            episodeTitle: currentMedia.overview || "",
            mediaType: "tv",
            watchedAt: new Date().toISOString(),
        })
    }

    // Show player section
    document.getElementById("contentSections").style.display = "none"
    document.getElementById("videoPlayerSection").style.display = "block"

    // Set player title
    document.getElementById("playerTitle").textContent = playerTitle

    // Show/hide episode navigation
    const prevBtn = document.getElementById("prevEpisodeBtn")
    const nextBtn = document.getElementById("nextEpisodeBtn")

    if (mediaType === "tv") {
        prevBtn.style.display = "inline-block"
        nextBtn.style.display = "inline-block"
        prevBtn.onclick = () => previousEpisode()
        nextBtn.onclick = () => nextEpisode()
    } else {
        prevBtn.style.display = "none"
        nextBtn.style.display = "none"
    }

    // Create vidsrc embed URL using TMDB ID
    let vidsrcUrl = ""
    if (mediaType === "movie") {
        vidsrcUrl = `https://vidsrc.cc/v2/embed/movie/${mediaId}`
    } else if (mediaType === "tv" && season !== null && episode !== null) {
        vidsrcUrl = `https://vidsrc.cc/v2/embed/tv/${mediaId}/${season}/${episode}`
    }

    // Load vidsrc embed with dizipal alternative option
    const videoContent = document.getElementById("videoContent")
    videoContent.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative;">
            <iframe src="${vidsrcUrl}" style="width: 100%; height: 500px; border: none;" allowfullscreen></iframe>
            <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                <button onclick="loadDizipalAlternative(${mediaId}, '${mediaType}', ${season || 'null'}, ${episode || 'null'}, '${playerTitle}')" style="background: rgba(229,9,20,0.9); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-play-circle"></i> Dizipal
                </button>
            </div>
        </div>
    `

    // Scroll to player
    document.getElementById("videoPlayerSection").scrollIntoView({ behavior: "smooth" })

    console.log("Showing streaming options for:", playerTitle)
}

// Fallback search interface function
function showSearchInterface(searchQuery, playerTitle, mediaType) {
    // Show player section
    document.getElementById("contentSections").style.display = "none"
    document.getElementById("videoPlayerSection").style.display = "block"

    // Set player title
    document.getElementById("playerTitle").textContent = playerTitle

    // Show/hide episode navigation
    const prevBtn = document.getElementById("prevEpisodeBtn")
    const nextBtn = document.getElementById("nextEpisodeBtn")

    if (mediaType === "tv") {
        prevBtn.style.display = "inline-block"
        nextBtn.style.display = "inline-block"
        prevBtn.onclick = () => previousEpisode()
        nextBtn.onclick = () => nextEpisode()
    } else {
        prevBtn.style.display = "none"
        nextBtn.style.display = "none"
    }

    // Create streaming options interface
    const videoContent = document.getElementById("videoContent")
    const encodedQuery = encodeURIComponent(searchQuery)
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`

    // Alternative streaming sites for Turkish content
    const streamingSites = [
        { name: "YouTube", url: youtubeSearchUrl, icon: "fab fa-youtube", color: "#ff0000" },
        { name: "Google Arama", url: `https://www.google.com/search?q=${encodedQuery}`, icon: "fab fa-google", color: "#4285f4" },
        { name: "Türkçe Dublaj Siteleri", url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery + " full hd türkçe dublaj izle")}`, icon: "fas fa-search", color: "#e50914" }
    ]

    const buttonsHTML = streamingSites.map(site =>
        `<button onclick="window.open('${site.url}', '_blank')" style="background: ${site.color}; color: #fff; border: none; padding: 12px 20px; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: opacity 0.3s; margin: 5px; display: inline-flex; align-items: center; gap: 8px;">
            <i class="${site.icon}"></i> ${site.name}'da Ara
        </button>`
    ).join("")

    videoContent.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #fff; text-align: center; padding: 20px;">
            <i class="fas fa-play-circle" style="font-size: 4rem; color: #e50914; margin-bottom: 20px;"></i>
            <h3 style="margin-bottom: 15px;">${playerTitle}</h3>
            <p style="margin-bottom: 25px; opacity: 0.8; max-width: 500px;">Bu içeriği izlemek için aşağıdaki platformlardan birinde arama yapabilirsiniz:</p>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
                ${buttonsHTML}
            </div>
            <p style="margin-top: 20px; font-size: 0.85rem; opacity: 0.6;">İçerik mevcut değilse, farklı anahtar kelimelerle tekrar deneyin.</p>
        </div>
    `

    // Scroll to player
    document.getElementById("videoPlayerSection").scrollIntoView({ behavior: "smooth" })

    console.log("Showing search interface for:", playerTitle)
}

// Play episode
function playEpisode(tvId, season, episode) {
    playMedia(tvId, 'tv', season, episode)
}

// Hide player and show content
function hidePlayer() {
    document.getElementById("videoPlayerSection").style.display = "none"
    document.getElementById("contentSections").style.display = "block"
    document.getElementById("videoContent").innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <span>Video yükleniyor...</span>
        </div>
    `
}

// Previous episode
function previousEpisode() {
    if (!currentMedia || currentMedia.media_type !== "tv" || !currentSeason || !currentEpisode) return

    const prevEpisodeNum = currentEpisode - 1
    let prevSeasonNum = currentSeason

    if (prevEpisodeNum < 1) {
        prevSeasonNum = currentSeason - 1
        const prevSeasonData = currentSeasons.find(s => s.season_number === prevSeasonNum)
        if (!prevSeasonData) {
            alert("İlk bölüm oynatılıyor")
            return
        }
        playMedia(currentMedia.id, "tv", prevSeasonNum, prevSeasonData.episode_count)
    } else {
        playMedia(currentMedia.id, "tv", prevSeasonNum, prevEpisodeNum)
    }
}

// Next episode
function nextEpisode() {
    if (!currentMedia || currentMedia.media_type !== "tv" || !currentSeason || !currentEpisode) return

    const nextEpisodeNum = currentEpisode + 1
    let nextSeasonNum = currentSeason

    const currentSeasonData = currentSeasons.find(s => s.season_number === currentSeason)
    if (currentSeasonData && nextEpisodeNum > currentSeasonData.episode_count) {
        nextSeasonNum = currentSeason + 1
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

// Go to detail page
function goToDetail(mediaId, mediaType) {
    window.location.href = `detail.html?id=${mediaId}&type=${mediaType}`
}

function showActorDetails(actorId) {
    // Navigate to actor detail page passing actorId 
    window.location.href = `actor-detail.html?id=${actorId}`;
}

// Fetch movie trailers
async function fetchMovieTrailers(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        return data.results.filter(video => (video.type === "Trailer" || video.type === "Teaser" || video.type === "Clip") && video.site === "YouTube")
    } catch (error) {
        console.error("Error fetching movie trailers:", error)
        return []
    }
}

// Fetch TV show trailers (show-level and season-specific)
async function fetchTVTrailers(tvId) {
    try {
        const trailers = []
        console.log(`Fetching trailers for TV show ID: ${tvId}`)

        // Try Turkish first, then English if no results
        const languages = ['tr-TR', 'en-US']

        for (const lang of languages) {
            const showResponse = await fetch(`${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}&language=${lang}`)
            if (showResponse.ok) {
                const showData = await showResponse.json()
                console.log(`Show trailers in ${lang}:`, showData.results.length)
                const showTrailers = showData.results.filter(video =>
                    (video.type === "Trailer" || video.type === "Teaser" || video.type === "Clip" ||
                     video.type === "Featurette" || video.type === "Opening Credits" || video.type === "Behind the Scenes") &&
                    video.site === "YouTube"
                )
                if (showTrailers.length > 0) {
                    trailers.push({
                        season: 0, // Show-level trailers
                        videos: showTrailers
                    })
                    console.log(`Found ${showTrailers.length} show-level trailers in ${lang}`)
                    break // Stop trying other languages if we found trailers
                }
            }
        }

        // Fetch season-specific trailers (only for recent seasons to avoid too many API calls)
        const recentSeasons = currentSeasons
            .filter(s => s.season_number > 0)
            .sort((a, b) => b.season_number - a.season_number)
            .slice(0, 3) // Only check the 3 most recent seasons

        for (const season of recentSeasons) {
            for (const lang of languages) {
                const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${season.season_number}/videos?api_key=${API_KEY}&language=${lang}`)
                if (response.ok) {
                    const data = await response.json()
                    console.log(`Season ${season.season_number} trailers in ${lang}:`, data.results.length)
                    const seasonTrailers = data.results.filter(video =>
                        (video.type === "Trailer" || video.type === "Teaser" || video.type === "Clip" ||
                         video.type === "Featurette" || video.type === "Opening Credits" || video.type === "Behind the Scenes") &&
                        video.site === "YouTube"
                    )
                    if (seasonTrailers.length > 0) {
                        trailers.push({
                            season: season.season_number,
                            videos: seasonTrailers
                        })
                        console.log(`Found ${seasonTrailers.length} season ${season.season_number} trailers in ${lang}`)
                        break // Stop trying other languages for this season
                    }
                }
            }
        }

        console.log(`Total trailer groups found: ${trailers.length}`)
        return trailers
    } catch (error) {
        console.error("Error fetching TV trailers:", error)
        return []
    }
}

// Show TV trailers
async function showTVTrailers(tvId) {
    try {
        // Update active season button
        const seasonBtns = document.querySelectorAll(".season-btn")
        seasonBtns.forEach(btn => btn.classList.remove("active"))
        if (event && event.target) {
            event.target.classList.add("active")
        }

        const episodesGrid = document.getElementById("episodesGrid")

        // Show loading
        episodesGrid.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <span>Fragmanlar yükleniyor...</span>
            </div>
        `

        const trailers = await fetchTVTrailers(tvId)

        if (trailers.length === 0) {
            episodesGrid.innerHTML = '<p class="text-muted">Bu dizi için fragman bulunamadı.</p>'
            return
        }

        // Create a global array to store trailer data
        window.currentTrailers = trailers

        episodesGrid.innerHTML = trailers.map((trailerGroup, groupIndex) => {
            const seasonTrailers = trailerGroup.videos.map((trailer, trailerIndex) => `
                <div class="episode-card" onclick="playTrailerByIndex(${groupIndex}, ${trailerIndex})">
                    <div class="episode-poster" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-play-circle" style="font-size: 3rem; color: white;"></i>
                    </div>
                    <div class="episode-info">
                        <div class="episode-number">Sezon ${trailerGroup.season} Fragmanı</div>
                        <div class="episode-title">${trailer.name || `Sezon ${trailerGroup.season} Fragmanı`}</div>
                        <div class="episode-overview">YouTube'da izle</div>
                    </div>
                </div>
            `).join("")

            return seasonTrailers
        }).join("")

        console.log(`Loaded ${trailers.length} trailer groups`)
    } catch (error) {
        console.error("Error loading TV trailers:", error)
        document.getElementById("episodesGrid").innerHTML = '<p class="text-muted">Fragmanlar yüklenirken hata oluştu.</p>'
    }
}

// Play trailer by index from global trailers array
function playTrailerByIndex(groupIndex, trailerIndex) {
    if (!window.currentTrailers || !window.currentTrailers[groupIndex] ||
        !window.currentTrailers[groupIndex].videos[trailerIndex]) {
        console.error("Trailer not found at indices:", groupIndex, trailerIndex)
        return
    }

    const trailer = window.currentTrailers[groupIndex].videos[trailerIndex]
    playTrailer(trailer)
}

// Play trailer
function playTrailer(trailer) {
    if (!trailer || !trailer.key) return

    const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`
    const playerTitle = `${currentMedia.title || currentMedia.name} - Fragman`

    // Show player section
    document.getElementById("contentSections").style.display = "none"
    document.getElementById("videoPlayerSection").style.display = "block"

    // Set player title
    document.getElementById("playerTitle").textContent = playerTitle

    // Hide episode navigation
    document.getElementById("prevEpisodeBtn").style.display = "none"
    document.getElementById("nextEpisodeBtn").style.display = "none"

    // Load trailer
    const videoContent = document.getElementById("videoContent")
    videoContent.innerHTML = `<iframe src="${youtubeUrl}" class="video-iframe" allowfullscreen></iframe>`

    // Scroll to player
    document.getElementById("videoPlayerSection").scrollIntoView({ behavior: "smooth" })
}

// Load dizipal embed directly
function loadDizipalEmbed(imdbId, mediaType, season, episode, playerTitle) {
    // Create dizipal.xyz embed URL
    let dizipalUrl = ""
    if (mediaType === "movie") {
        dizipalUrl = `https://dizipal.xyz/embed/${imdbId}`
    } else if (mediaType === "tv" && season !== null && episode !== null) {
        dizipalUrl = `https://dizipal.xyz/embed/${imdbId}/${season}/${episode}`
    }

    // Load dizipal embed
    const videoContent = document.getElementById("videoContent")
    videoContent.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative;">
            <iframe src="${dizipalUrl}" style="width: 100%; height: 500px; border: none;" allowfullscreen></iframe>
        </div>
    `

    console.log("Loading dizipal embed for:", playerTitle, dizipalUrl)
}

// Load dizipal as alternative option
function loadDizipalAlternative(mediaId, mediaType, season, episode, playerTitle) {
    // Get IMDB ID from current media
    const imdbId = currentMedia.external_ids?.imdb_id
    if (!imdbId) {
        alert("Bu içerik için IMDB ID bulunamadı. Dizipal kullanılamıyor.")
        return
    }

    // Create dizipal.xyz embed URL
    let dizipalUrl = ""
    if (mediaType === "movie") {
        dizipalUrl = `https://dizipal.xyz/embed/${imdbId}`
    } else if (mediaType === "tv" && season !== null && episode !== null) {
        dizipalUrl = `https://dizipal.xyz/embed/${imdbId}/${season}/${episode}`
    }

    // Load dizipal embed with back to vidsrc option
    const videoContent = document.getElementById("videoContent")
    videoContent.innerHTML = `
        <div style="width: 100%; height: 100%; position: relative;">
            <iframe src="${dizipalUrl}" style="width: 100%; height: 500px; border: none;" allowfullscreen></iframe>
            <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                <button onclick="playMedia(${mediaId}, '${mediaType}', ${season || 'null'}, ${episode || 'null'})" style="background: rgba(0,123,255,0.9); color: #fff; border: none; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-arrow-left"></i> Vidsrc'ye Dön
                </button>
            </div>
        </div>
    `

    console.log("Loading dizipal alternative for:", playerTitle, dizipalUrl)
}

// Show error
function showError(message) {
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #141414; color: #fff;">
            <h2>Hata</h2>
            <p>${message}</p>
            <button onclick="history.back()" class="back-btn" style="margin-top: 20px;">Geri Dön</button>
        </div>
    `
}
