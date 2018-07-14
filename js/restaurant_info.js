let restaurant;
var newMap;

/**
 * Register worker as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
	registerWorker();
	initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.newMap = L.map('map', {
				center: [restaurant.latlng.lat, restaurant.latlng.lng],
				zoom: 16,
				scrollWheelZoom: false
			});
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
				mapboxToken: 'pk.eyJ1IjoicmF2aS0yOTEyIiwiYSI6ImNqamx5YnlmdTJ5dmMzcXAyaXJxcjhtN2EifQ.d3oExqPedc_oVHTgvqkfXg',
				maxZoom: 18,
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
					'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				id: 'mapbox.streets'
			}).addTo(newMap);
			fillBreadcrumb();
			const marker = DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
		}
	});
};
/*
window.initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
};
*/
/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant);
		return;
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		error = 'No restaurant id in URL';
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			callback(null, restaurant);
		});
	}
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;

	const address = document.getElementById('restaurant-address');
	address.innerHTML = '<strong>Visit us at:</strong><br>' + restaurant.address;

	/**
	 * Create responsive images
	 */
	const imgf = DBHelper.imageUrlForRestaurant(restaurant).split('.');
	let img_1x = `${imgf[0]}-1x.${imgf[1]}`;
	let img_2x = `${imgf[0]}-2x.${imgf[1]}`;
	let img_hd = `${imgf[0]}-hd.${imgf[1]}`;
	const pic = document.getElementById('restaurant-pic');
	var str = `<source media="(max-width: 767px)" srcset="${img_1x} 1x, ${img_2x} 2x">
			  <source media="(min-width: 768px)" srcset="${img_2x} 1x, ${img_hd} 2x">
			  <img id="restaurant-img" src="${img_1x}" alt="${restaurant.name}">`;

	pic.innerHTML = str;

	const figcaption = document.getElementById('restaurant-caption');
	figcaption.innerText = `${restaurant.name} restaurant, ${restaurant.cuisine_type} cuisine`;

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;

	const neighborhood = document.getElementById('restaurant-neighborhood');
	neighborhood.innerHTML = restaurant.neighborhood;

	const mapEl = document.getElementById('map-container');
	mapEl.setAttribute('aria-label', `Google Map showing ${restaurant.name} restaurant marker`);

	const details = document.getElementById('restaurant-details');
	details.setAttribute('aria-label', `Address and opening times for ${restaurant.name} restuarant`);

	const avgratingcontainer = document.getElementById('avg-rating-container');
	avgratingcontainer.setAttribute('aria-label', `Average rating for ${restaurant.name} restaurant`);

	const resviewcontainer = document.getElementById('reviews-container');
	resviewcontainer.setAttribute('aria-label', `Customer reviews for ${restaurant.name} restaurant`);

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	fillReviewsHTML();

	// map resize using image
	const rImg = document.getElementById('restaurant-img');
	rImg.onload = () => {
		document.getElementById('map').style.height = rImg.clientHeight + 'px';
	};
	window.addEventListener("resize", () => {
		document.getElementById('map').style.height = rImg.clientHeight + 'px';
	});
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h2');
	title.classList.add('col-xs-12', 'col-sm-12', 'col', 'mb-0', 'pb-0', 't-l');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	let avgRating = 0;
	let count = 0;
	reviews.forEach(review => {
		avgRating += review.rating;
		count += 1;
	});
	const avgRatEl = document.getElementById('avg-rating');
	avgRatEl.innerText = (avgRating / count).toFixed(1);
	const starEl = document.getElementById('stars-percent');
	let starPercent = (100 * avgRating / count / 5).toFixed(1);
	starEl.setAttribute('style', `width: ${starPercent}%`);

	/**
	 * Create reviews
	 */
	var str = `${reviews.map(review =>
								`<li class="col-xs-12 col-sm-12 t-l">
									<div class="col p-0">
										<p class="t-l review-head">
											${review.name}
											<span style="float: right;">${review.date}</span>
										</p>
										<div class="t-l block">
											<p class="mb-0 rating">Rating: ${review.rating}</p>
											<p>${review.comments}</p>
										</div>
									</div>
								</li>`).join('')}`;
	ul.innerHTML = str;
	container.appendChild(ul);
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Service worker registration
 */
registerWorker = () => {
	if (!navigator.serviceWorker) return;

	navigator.serviceWorker.register('sw.js').then(() => {
		console.log('Registration worked');
	}).catch(() => {
		console.log('Registration failed');
	});
};