import { DateTime } from 'luxon';
import { fetchRandomImages, fetchPopularImages, fetchLatestImage, fetchDailyImage, incrementClickCount, fetchLastImages, } from '../helpers/fetchingFunctions';
const randomTab = document.getElementById('random');
const popularTab = document.getElementById('popular');
const latestTab = document.getElementById('latest');
//Observer for lazy loading
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.getAttribute('data-src') || '';
            observer.unobserve(img);
        }
    });
}, { threshold: 0.01 });
// Observe images with 'data-src' attribute
document
    .querySelectorAll('img[data-src]')
    .forEach((img) => observer.observe(img));
// Observe images with 'data-src' attribute
document
    .querySelectorAll('img[data-src]')
    .forEach((img) => observer.observe(img));
document
    .querySelectorAll('img[data-src]')
    .forEach((img) => observer.observe(img));
// Set up event listeners on the list items
randomTab?.addEventListener('click', async () => {
    const images = await fetchRandomImages();
    displayImages(images);
});
popularTab?.addEventListener('click', async () => {
    // Fetch the latest image from the server
    const images = await fetchPopularImages();
    displayImages(images);
});
latestTab?.addEventListener('click', async () => {
    const images = await fetchLastImages(); // changed from fetchLatestImage to fetchLastImages
    displayImages(images);
});
function displayImages(images) {
    // Loop through each image container
    for (let i = 0; i < 9; i++) {
        const photo = document.getElementById(`photo${i + 1}`);
        // Check if image data exists
        if (images[i]) {
            // Set image source and alt text
            photo.setAttribute('data-src', images[i].url ?? '');
            photo.alt = images[i].title ?? '';
            // Ensure observer is observing the image
            observer.observe(photo);
            // Add 'loaded' class to the image when it's loaded
            photo.onload = function () {
                ;
                this.classList.add('loaded');
            };
        }
    }
}
function attachClickEventToPhotos(images) {
    for (let i = 0; i < images.length; i++) {
        const photoDiv = document.querySelector(`.ui-photos:nth-child(${i + 1})`);
        if (photoDiv) {
            photoDiv.addEventListener('click', () => {
                updateLeftWrapper(images[i]);
                incrementClickCount(images[i]);
            });
        }
    }
}
function updateLeftWrapper(image) {
    const dailyImage = document.getElementById('dailyImage');
    const imageTitle = document.getElementById('imageTitle');
    const imageDate = document.getElementById('imageDate');
    const imageDescription = document.getElementById('imageDescription');
    dailyImage.src = image.url ?? '';
    imageTitle.textContent = image.title ?? '';
    imageDate.textContent = image.date ?? '';
    imageDescription.textContent = image.explanation ?? '';
}
// After fetching and displaying images, attach click event to each .ui-photos div.
async function onTabClick(fetchImages) {
    const images = await fetchImages();
    displayImages(images);
    attachClickEventToPhotos(images);
}
randomTab?.addEventListener('click', () => onTabClick(fetchRandomImages));
popularTab?.addEventListener('click', () => onTabClick(fetchPopularImages));
latestTab?.addEventListener('click', async () => {
    const image = await fetchLatestImage();
    displayImages([image]);
    attachClickEventToPhotos([image]);
});
document.getElementById('searchButton').addEventListener('click', () => {
    const selectedDate = document.getElementById('searchDate').value;
    fetchDailyImage(selectedDate);
});
fetchDailyImage(new Date().toISOString().split('T')[0]);
window.addEventListener('load', async () => {
    const images = await fetchRandomImages();
    displayImages(images);
    attachClickEventToPhotos(images);
    const todayInET = DateTime.local().setZone('America/New_York');
    const today = todayInET.toISODate();
    if (today !== null) {
        fetchDailyImage(today);
    }
});
