// Player page JavaScript
const API_KEY = "999a2c8d29cd1833fa98446f909f19eb"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"

// Global variables
let currentMedia = null
let currentSeasons = []
let currentSeason = null
let currentEpisode = null
let movieTrailers = []
let comments = []

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');;
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initialize player page
document.addEventListener("DOMContentLoaded", async () => {
    const mediaId = getUrlParameter('id')
    const mediaType = getUrlParameter('type')
    const season = getUrlParameter('season')
    const episode = getUrlParameter('episode')

    if (!mediaId || !mediaType) {
        showError("Geçersiz içerik ID'si veya türü")
        return
    }

    try {
        await loadMediaDetails(mediaId, mediaType)

        if (mediaType === "tv") {
            currentSeasons = currentMedia.seasons || []
            loadSeasons(mediaId)

            if (season && episode) {
                currentSeason = parseInt(season)
                currentEpisode = parseInt(episode)
                loadVideo(mediaId, mediaType, currentSeason, currentEpisode)
            } else {
                // Load first episode if no specific episode provided
                const firstSeason = currentSeasons.find(s => s.season_number > 0)
                if (firstSeason) {
                    loadEpisodes(mediaId, firstSeason.season_number, true)
                }
            }
        } else {
            loadVideo(mediaId, mediaType)
        }

        loadRelatedContent(mediaId, mediaType)
        loadComments(mediaId, mediaType)
    } catch (error) {
        console.error("Error loading player:", error)
        showError("Video yüklenirken hata oluştu")
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

        updatePageTitle(media, mediaType)
        updateHeroSection(media, mediaType)
        console.log("Media details loaded successfully")
    } catch (error) {
        console.error("Error loading media details:", error)
        throw error
    }
}

// Update page title
function updatePageTitle(media, mediaType) {
    let title = ""
    if (mediaType === "movie") {
        title = media.title || "Film"
    } else {
        title = media.name || "Dizi"
        if (currentSeason && currentEpisode) {
            title += ` - S${currentSeason}E${currentEpisode}`
        }
    }

    document.getElementById("videoTitle").textContent = title
    document.title = `${title} - Dizicom`
}

// Update hero section
function updateHeroSection(media, mediaType) {
    const heroSection = document.querySelector('.hero-section')
    if (!heroSection) return

    // Set background image
    const backdropUrl = media.backdrop_path
        ? `${BACKDROP_BASE_URL}${media.backdrop_path}`
        : media.poster_path
        ? `${IMAGE_BASE_URL}${media.poster_path}`
        : '/placeholder.svg?height=400&width=800'

    heroSection.style.backgroundImage = `url('${backdropUrl}')`

    // Update poster image
    const posterImg = heroSection.querySelector('.hero-poster')
    if (posterImg) {
        const posterUrl = media.poster_path
            ? `${IMAGE_BASE_URL}${media.poster_path}`
            : '/placeholder.svg?height=300&width=200'
        posterImg.src = posterUrl
        posterImg.alt = mediaType === 'movie' ? media.title : media.name
    }
}

// Load video content
function loadVideo(mediaId, mediaType, season = null, episode = null) {
    const videoContent = document.getElementById("videoContent")

    // Create vidsrc embed URL
    let vidsrcUrl = ""
    if (mediaType === "movie") {
        vidsrcUrl = `https://vidsrc.cc/v2/embed/movie/${mediaId}`
    } else if (mediaType === "tv" && season !== null && episode !== null) {
        vidsrcUrl = `https://vidsrc.cc/v2/embed/tv/${mediaId}/${season}/${episode}`
    }

    // Load vidsrc embed
    videoContent.innerHTML = `
        <iframe src="${vidsrcUrl}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
    `

    // Update episode navigation
    updateEpisodeNavigation(mediaType, season, episode)

    console.log("Video loaded:", vidsrcUrl)
}

// Update episode navigation buttons
function updateEpisodeNavigation(mediaType, season, episode) {
    const prevBtn = document.getElementById("prevEpisodeBtn")
    const nextBtn = document.getElementById("nextEpisodeBtn")

    if (mediaType === "tv") {
        prevBtn.style.display = "inline-block"
        nextBtn.style.display = "inline-block"
        prevBtn.onclick = () => navigateEpisode(-1)
        nextBtn.onclick = () => navigateEpisode(1)
    } else {
        prevBtn.style.display = "none"
        nextBtn.style.display = "none"
    }
}

// Navigate to previous/next episode
function navigateEpisode(direction) {
    if (!currentMedia || currentMedia.media_type !== "tv" || !currentSeason || !currentEpisode) return

    const currentSeasonData = currentSeasons.find(s => s.season_number === currentSeason)
    if (!currentSeasonData) return

    let newSeason = currentSeason
    let newEpisode = currentEpisode + direction

    if (newEpisode < 1) {
        newSeason = currentSeason - 1
        const prevSeasonData = currentSeasons.find(s => s.season_number === newSeason)
        if (!prevSeasonData) {
            alert("İlk bölüm oynatılıyor")
            return
        }
        newEpisode = prevSeasonData.episode_count
    } else if (newEpisode > currentSeasonData.episode_count) {
        newSeason = currentSeason + 1
        const nextSeasonData = currentSeasons.find(s => s.season_number === newSeason)
        if (!nextSeasonData) {
            alert("Son bölüm oynatılıyor")
            return
        }
        newEpisode = 1
    }

    // Navigate to new episode
    const url = `player.html?id=${currentMedia.id}&type=tv&season=${newSeason}&episode=${newEpisode}`
    window.location.href = url
}

// Load seasons for TV shows
function loadSeasons(tvId) {
    if (!currentSeasons || currentSeasons.length === 0) {
        document.getElementById("episodeNavigation").style.display = "none"
        return
    }

    document.getElementById("episodeNavigation").style.display = "block"

    const seasonSelector = document.getElementById("seasonSelector")
    seasonSelector.innerHTML = currentSeasons
        .filter(season => season.season_number > 0)
        .map(season => `
            <button class="control-btn season-btn" onclick="loadEpisodes(${tvId}, ${season.season_number})">
                Sezon ${season.season_number}
            </button>
        `).join("")

    // Load first season by default if no specific episode
    if (!currentSeason) {
        const firstSeason = currentSeasons.find(s => s.season_number > 0)
        if (firstSeason) {
            loadEpisodes(tvId, firstSeason.season_number)
        }
    }
}

// Load episodes for a season
async function loadEpisodes(tvId, seasonNumber, autoLoadFirst = false) {
    try {
        console.log(`Loading episodes for TV ${tvId}, Season ${seasonNumber}`)

        // Update active season button
        const seasonBtns = document.querySelectorAll(".season-btn")
        seasonBtns.forEach(btn => btn.classList.remove("active"))
        const targetBtn = document.querySelector(`.season-btn[onclick*="loadEpisodes(${tvId}, ${seasonNumber})"]`)
        if (targetBtn) {
            targetBtn.classList.add("active")
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
                    : "/placeholder.svg?height=120&width=200"

                const isCurrentEpisode = currentSeason === seasonNumber && currentEpisode === episode.episode_number
                const activeClass = isCurrentEpisode ? "active" : ""

                return `
                    <div class="episode-item ${activeClass}" onclick="playEpisode(${tvId}, ${seasonNumber}, ${episode.episode_number})">
                        <img src="${posterUrl}" alt="Episode ${episode.episode_number}" class="episode-poster" onerror="this.src='/placeholder.svg?height=120&width=200'">
                        <div class="episode-info">
                            <div class="episode-number">Bölüm ${episode.episode_number}</div>
                            <div class="episode-title">${episode.name}</div>
                            <div class="episode-desc">${episode.overview || "Açıklama bulunamadı."}</div>
                        </div>
                    </div>
                `
            }).join("")

            // Auto-load first episode if requested
            if (autoLoadFirst && !currentEpisode) {
                playEpisode(tvId, seasonNumber, 1)
            }
        } else {
            episodesGrid.innerHTML = '<p class="text-muted">Bu sezonda bölüm bulunamadı.</p>'
        }

        console.log(`Loaded ${seasonData.episodes?.length || 0} episodes`)
    } catch (error) {
        console.error("Error loading episodes:", error)
        document.getElementById("episodesGrid").innerHTML = '<p class="text-muted">Bölümler yüklenirken hata oluştu.</p>'
    }
}

// Play episode
function playEpisode(tvId, season, episode) {
    const url = `player.html?id=${tvId}&type=tv&season=${season}&episode=${episode}`
    window.location.href = url
}

// Load related content
async function loadRelatedContent(mediaId, mediaType) {
    try {
        const endpoint = mediaType === "movie" ? "movie" : "tv"
        const response = await fetch(`${BASE_URL}/${endpoint}/${mediaId}/recommendations?api_key=${API_KEY}&language=tr-TR&page=1`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const relatedGrid = document.getElementById("relatedGrid")

        if (data.results && data.results.length > 0) {
            const related = data.results.slice(0, 8)
            relatedGrid.innerHTML = related.map(item => {
                const posterUrl = item.poster_path
                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                    : "/placeholder.svg?height=200&width=150"

                const title = item.title || item.name
                const year = (item.release_date || item.first_air_date)
                    ? new Date(item.release_date || item.first_air_date).getFullYear()
                    : "Bilinmiyor"

                return `
                    <div class="related-item" onclick="goToDetail(${item.id}, '${mediaType}')">
                        <img src="${posterUrl}" alt="${title}" class="related-poster" onerror="this.src='/placeholder.svg?height=200&width=150'">
                        <div class="related-info">
                            <div class="related-item-title">${title}</div>
                            <div class="related-meta">${year}</div>
                        </div>
                    </div>
                `
            }).join("")
        } else {
            relatedGrid.innerHTML = '<p class="text-muted">Benzer içerik bulunamadı.</p>'
        }
    } catch (error) {
        console.error("Error loading related content:", error)
        document.getElementById("relatedGrid").innerHTML = '<p class="text-muted">Benzer içerik yüklenirken hata oluştu.</p>'
    }
}

// Save comments to localStorage
function saveComments(mediaId, mediaType) {
    const storageKey = `comments_${mediaType}_${mediaId}`
    localStorage.setItem(storageKey, JSON.stringify(comments))
}

// Load comments from localStorage
function loadComments(mediaId, mediaType) {
    const storageKey = `comments_${mediaType}_${mediaId}`
    const storedComments = localStorage.getItem(storageKey)

    if (storedComments) {
        comments = JSON.parse(storedComments)
    } else {
        // Default comments if none stored
        comments = [
            {
                id: 1,
                author: "FilmSever123",
                date: "2024-01-15",
                text: "Harika bir bölüm! Kesinlikle beklediğim gibiydi.",
                likes: 12
            },
            {
                id: 2,
                author: "DiziFan",
                date: "2024-01-14",
                text: "Oyuncular çok başarılı. Final sahnesi muhteşem!",
                likes: 8
            },
            {
                id: 3,
                author: "SinemaMeraklısı",
                date: "2024-01-13",
                text: "Bu dizi gittikçe güzelleşiyor. Devamını merakla bekliyorum.",
                likes: 15
            }
        ]
        // Save default comments to localStorage
        saveComments(mediaId, mediaType)
    }

    displayComments()
}

// Display comments
function displayComments() {
    const commentsList = document.getElementById("commentsList")
    const commentCount = document.getElementById("commentCount")

    commentCount.textContent = `${comments.length} yorum`

    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-muted">Henüz yorum yapılmamış.</p>'
        return
    }

    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-author">${comment.author}</div>
            <div class="comment-date">${formatDate(comment.date)}</div>
            <div class="comment-text">${comment.text}</div>
        </div>
    `).join("")
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// Handle comment form submission
document.addEventListener("DOMContentLoaded", () => {
    const commentForm = document.querySelector(".comment-form")
    if (commentForm) {
        commentForm.addEventListener("submit", (e) => {
            e.preventDefault()
            const textarea = commentForm.querySelector(".comment-input")
            const commentText = textarea.value.trim()

            if (commentText) {
                // Add new comment (in a real app, this would be sent to backend)
                const newComment = {
                    id: comments.length + 1,
                    author: "Misafir Kullanıcı",
                    date: new Date().toISOString().split('T')[0],
                    text: commentText,
                    likes: 0
                }

                comments.unshift(newComment)
                displayComments()
                textarea.value = ""

                // Save comments to localStorage
                const mediaId = getUrlParameter('id')
                const mediaType = getUrlParameter('type')
                saveComments(mediaId, mediaType)

                // Show success message
                alert("Yorumunuz başarıyla eklendi!")
            }
        })
    }
})

// Go to detail page
function goToDetail(mediaId, mediaType) {
    window.location.href = `detail.html?id=${mediaId}&type=${mediaType}`
}

// Show error
function showError(message) {
    document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #141414; color: #fff;">
            <h2>Hata</h2>
            <p>${message}</p>
            <button onclick="history.back()" class="control-btn" style="margin-top: 20px;">Geri Dön</button>
        </div>
    `
}
