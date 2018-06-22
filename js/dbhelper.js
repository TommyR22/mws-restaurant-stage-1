/**
 * Common database helper functions.
 */
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }


    static createLocalIDBStore(restaurants) {
        // Get the compatible IndexedDB
        // This works on all devices/browsers, and uses IndexedDBShim as a final fallback
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

        // Open (or create) the database
        var open = indexedDB.open("RestaurantDB", 1);

        // Create the IndexDb schema
        open.onupgradeneeded = function() {
            var db = open.result;
            var store = db.createObjectStore("RestaurantStore", { keyPath: "id" });
            var index = store.createIndex("by-id", "id");

        };

        open.onerror = function(err) {
            console.error("Something went wrong with IndexDB: " + err.target.errorCode);
        };

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction("RestaurantStore", "readwrite");
            var store = tx.objectStore("RestaurantStore");
            var index = store.index("by-id");

            // Add the restaurant data
            restaurants.forEach(function(restaurant) {
                store.put(restaurant);
            });

            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
        }
    }

    static getCachedData(callback) {
        var restaurants = [];

        // Get the compatible IndexedDB version
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
        var open = indexedDB.open("RestaurantDB", 1);

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction("RestaurantStore", "readwrite");
            var store = tx.objectStore("RestaurantStore");
            var getData = store.getAll();

            getData.onsuccess = function() {
                callback(null, getData.result);
            }

            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
        }

    }
    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', DBHelper.DATABASE_URL);

        xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
                const restaurants = JSON.parse(xhr.responseText);

                DBHelper.createLocalIDBStore(restaurants); // Cache restaurants in IDB

                callback(null, restaurants);
            } else { // Oops!. Got an error from server.
                const error = (`Request failed. Returned status of ${xhr.status}`);
                callback(error, null);
            }
        };

        xhr.onerror = () => {
            DBHelper.getCachedData((error, restaurants) => {
                if (restaurants.length > 0) {
                console.log('Unable to fetch data from server. Using cache data instead', restaurants);

                callback(null, restaurants);
            }
        });
        }
        xhr.send();
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
            callback(null, restaurant);
        } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
        }
    }
    });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
    }
    });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
    }
    });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
    }
    });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
    }
    });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
    }
    });
    }
    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph}.webp`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP}
        );
        return marker;
    }

    static addReview(review) {
        let api = {
            name: 'addReview',
            data: review,
            object_type: 'review'
        };

        // Check if online
        if(!navigator.onLine && (api.name === 'addReview')) {
            sendDataWhenOnline(api);
            return;
        }

        var api_url = `http://localhost:1337/reviews`;

        let reviewSend = {
            "name": review.name,
            "rating": parseInt(review.rating),
            "comments": review.comments,
            "restaurant_id": parseInt(review.restaurant_id)
        };

        var fetch_options = {
            method: 'POST',
            body: JSON.stringify(reviewSend),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        };

        fetch(api_url,fetch_options).then( (response) => {
        const contentType = response.headers.get('content-type');
        if(contentType && contentType.indexOf('application/json') !== -1 ) {
            return response.json();
        } else {
            return 'API call successfull';
        }
    }).then( (data) => {
            console.log(`API: Fetch successful!`);
        callback(null, data);
    }).catch( error => callback(error, null));


    }



    static sendDataWhenOnline(api) {
        console.log(api);
        localStorage.setItem('data', JSON.stringify(api.data));
        console.log(`Local Storage: ${api.object_type} stored`);
        window.addEventListener('online', (event) => {
            let data = JSON.parse(localStorage.getItem('data'));

        if(data !== null) {
            console.log(data);
            if (api.api.name === 'addReview') {
                addReview(api.data, (error, data) => {
                    error ? console.log(error) : console.log(data);
                });
            }

            console.log('LocalState: data sent to api');

            localStorage.removeItem('data');
            console.log(`Local Storage: ${api.object_type} removed`);
        }
        console.log('Browser: Online again!');
    });
    }


    static addRemoveFavourite( add, restaurant){
        console.log(restaurant);

        // Get the compatible IndexedDB version
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
        var open = indexedDB.open("RestaurantDB", 1);

        open.onsuccess = function() {
            // Start a new transaction
            var db = open.result;
            var tx = db.transaction("RestaurantStore", "readwrite");
            var store = tx.objectStore("RestaurantStore");
            var index = store.index("by-id");

            // Add the restaurant data
            restaurant.is_favorite = add;
            store.put(restaurant);

            var api_url = `http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=${add}`;

            var fetch_options = {
                method: 'PUT'
            };

            fetch(api_url,fetch_options).then( (response) => {
                const contentType = response.headers.get('content-type');
            if(contentType && contentType.indexOf('application/json') !== -1 ) {
                return response.json();
            } else {
                return 'API call successfull';
            }
            }).then( (data) => {
                console.log(`API: Fetch successful!`);
            }).catch( error =>  console.log(`Error!`, error));


            // Close the db when the transaction is done
            tx.oncomplete = function() {
                db.close();
            };
        }
    }


    /**
     * Fetch reviews
     */
    static fetchReviewsById(callback) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', DBHelper.DATABASE_URL);

        xhr.onload = () => {
            if (xhr.status === 200) { // Got a success response from server!
                const restaurants = JSON.parse(xhr.responseText);

                DBHelper.createLocalIDBStore(restaurants); // Cache restaurants in IDB

                callback(null, restaurants);
            } else { // Oops!. Got an error from server.
                const error = (`Request failed. Returned status of ${xhr.status}`);
                callback(error, null);
            }
        };

        xhr.onerror = () => {
            DBHelper.getCachedData((error, restaurants) => {
                if (restaurants.length > 0) {
                console.log('Unable to fetch data from server. Using cache data instead', restaurants);

                callback(null, restaurants);
            }
        });
        }
        xhr.send();
    }


}