let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  //initMap(); // added
  updateRestaurants();
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
/*
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: '<your MAPBOX API KEY HERE>',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}*/
 window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  //updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    //self.markers.forEach(marker => marker.remove());
    self.markers.forEach(marker => marker.setMap(null));
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  //restaurants.forEach(restaurant => {
  //  ul.append(createRestaurantHTML(restaurant));
  //});
  var str = `${restaurants.map(restaurant =>
    `<li class="col-xs-12 col-sm-12 col-md-6 col-lg-4">
          <div class="col p-0 card">
                <img id="restaurant-img" src="${DBHelper.imageUrlForRestaurant(restaurant)}" alt="${restaurant.name}">
                <div class="content">
                      <h1>${restaurant.name}</h1>
                      <p>${restaurant.neighborhood}</p>
                      <address>${restaurant.address}</address>
                      <a class="button" href="${DBHelper.urlForRestaurant(restaurant)}">View Details</a>
                </div>
          </div>
    </li>`
  ).join('')}`;
  ul.innerHTML = str;
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
/*createRestaurantHTML = (restaurant) => {
  const imgSrc = DBHelper.imageUrlForRestaurant(restaurant);
  const name = restaurant.name;
  const neighborhood = restaurant.neighborhood;
  const address = restaurant.address;
  const aHref = DBHelper.urlForRestaurant(restaurant);

  const li = document.createElement('li');
  li.classList.add('col-xs-12', 'col-sm-6', 'col-md-4', 'col-lg-4');

  const colDiv = document.createElement('div');
  colDiv.classList.add('col', 'p-0', 'card');

  const image = document.createElement('img');
  image.id = 'restaurant-img';
  image.src = imgSrc;
  colDiv.append(image);

  const div = document.createElement('div');
  div.className = 'content';

  const Name = document.createElement('h1');
  Name.innerHTML = name;
  div.append(Name);

  const neighbor = document.createElement('p');
  neighbor.innerHTML = neighborhood;
  div.append(neighbor);

  const addres = document.createElement('p');
  addres.innerHTML = address;
  div.append(addres);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = aHref;
  div.append(more);

  colDiv.append(div);
  li.append(colDiv);

  return li;
};*/

/**
 * Add markers for current restaurants to the map.
 */
/*addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

};*/
 addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

