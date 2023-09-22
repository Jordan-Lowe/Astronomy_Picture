// My Interface for the data fetched from the NASA API
interface Data {
	error?: { message: string };
	code?: any;
	msg?: string;
	media_type?: "image" | "video";
	url?: string;
	title?: string;
	date?: string;
	copyright?: string;
	explanation?: string;
}

class Cards {
	private photos: Data[] = [];
	private cardState: string = "photos";

	constructor(public onImageClick: (imageData: Data) => void) {
		this.fetchData();
	}

	private fetchData() {
		// Fetch directly from NASA API for 9 images
		fetch(
			"https://api.nasa.gov/planetary/apod?api_key=E1RwjszVbe0bxmJHHZ5mUr8uDuTpKUYPiHkTVosB&count=9"
		)
			.then((response) => response.json())
			.then((data) => {
				this.photos = data;
				this.render();
			})
			.catch((error) => console.error("Error fetching photos:", error));
	}

	public render() {
		const cardWrapper = document.createElement("div");
		cardWrapper.className = "cardWrapper";
		cardWrapper.setAttribute("data-state", this.cardState);

		const uiLayer = document.createElement("div");
		uiLayer.className = "ui-layer";

		this.photos.forEach((photoData) => {
			const uiPhoto = document.createElement("div");
			uiPhoto.className = "ui-photo";
			uiPhoto.setAttribute("data-photo", photoData.url!);
			uiPhoto.addEventListener("click", () => this.onImageClick(photoData));

			const img = document.createElement("img");
			img.src = photoData.url!;
			img.alt = photoData.title!;

			uiPhoto.appendChild(img);
			uiLayer.appendChild(uiPhoto);
		});

		cardWrapper.appendChild(uiLayer);

		const container = document.querySelector("#leftContainer");
		container?.appendChild(cardWrapper);
	}
}

function handleImageClick(imageData: Data): void {
	// Set the dailyImage to the image that was clicked
	document.getElementById("dailyImage")!.setAttribute("src", imageData.url!);
	document.getElementById("imageTitle")!.textContent = imageData.title!;
	document.getElementById("imageDate")!.textContent = imageData.date!;
	document.getElementById("imageDescription")!.textContent =
		imageData.explanation!;
}

new Cards(handleImageClick);

// Function to fetch daily image
function fetchDailyImage(dateToFetch: string) {
	const url = `https://api.nasa.gov/planetary/apod?date=${dateToFetch}&api_key=E1RwjszVbe0bxmJHHZ5mUr8uDuTpKUYPiHkTVosB`;

	fetch(url)
		.then((response) => response.json())
		.then((data) => {
			document.getElementById("dailyImage")!.setAttribute("src", data.url!);
			document.getElementById("imageTitle")!.textContent = data.title!;
			document.getElementById("imageDate")!.textContent = data.date!;
			document.getElementById("imageDescription")!.textContent =
				data.explanation!;
		})
		.catch((error) => console.error("Error fetching daily image:", error));
}

// Attach an event listener to the search button
document.getElementById("searchButton")!.addEventListener("click", () => {
	const selectedDate = (
		document.getElementById("searchDate") as HTMLInputElement
	).value;
	fetchDailyImage(selectedDate);
});

// Fetch the image for today on initial load
fetchDailyImage(new Date().toISOString().split("T")[0]);
