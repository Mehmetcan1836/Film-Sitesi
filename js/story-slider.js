// Story data
const stories = [
    {
        title: "The Flash",
        image: "img/theflash2023.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=4990845"
    },
    {
        title: "Recep İvedik 6",
        image: "img/recepivedik6.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=5445833"
    },
    {
        title: "Batman Draculaya Karsi",
        image: "img/batmandraculayakarsi.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=5445834"
    },
    {
        title: "Eyvah Eyvah 2",
        image: "img/Eyyvah_Eyvah_2_film_afişi.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=4990835"
    },
    {
        title: "Kolpaçino 4 4'lük",
        image: "img/kolpacino.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=4990854"
    },
    {
        title: "Parallel",
        image: "img/parallel.webp",
        video: "https://video.sibnet.ru/shell.php?videoid=5150223"
    },
    {
        title: "Harry Potter",
        image: "img/HarryPoter.webp",
        video: "https://video.sibnet.ru/shell.php?videoid=5150223"
    },
    {
        title: "Harry Potter2",
        image: "img/HarryPotter2.jpg",
        video: "https://video.sibnet.ru/shell.php?videoid=5150223"
    }
];

// Initialize story slider
document.addEventListener('DOMContentLoaded', () => {
    const storyContainer = document.querySelector('.story-container');
    const storyModal = document.querySelector('.story-modal');
    const storyVideo = document.querySelector('.story-video');
    const closeStory = document.querySelector('.close-story');

    // Create story items
    stories.forEach((story, index) => {
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.innerHTML = `
            <img src="${story.image}" alt="${story.title}">
            <span class="story-text">${story.title}</span>
        `;
        
        storyItem.addEventListener('click', () => {
            storyModal.classList.add('active');
            storyVideo.src = story.video;
            storyVideo.play();
        });

        storyContainer.appendChild(storyItem);
    });

    // Close story modal
    closeStory.addEventListener('click', () => {
        storyModal.classList.remove('active');
        storyVideo.pause();
        storyVideo.currentTime = 0;
    });

    // Close on outside click
    storyModal.addEventListener('click', (e) => {
        if (e.target === storyModal) {
            storyModal.classList.remove('active');
            storyVideo.pause();
            storyVideo.currentTime = 0;
        }
    });

    // Add keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            storyModal.classList.remove('active');
            storyVideo.pause();
            storyVideo.currentTime = 0;
        }
    });
});
