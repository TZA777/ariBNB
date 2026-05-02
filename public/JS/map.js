// =======================
// SET MAPBOX ACCESS TOKEN
// =======================

// Assign your Mapbox API token (required to load maps)
// mapToken is usually passed from backend (EJS → frontend)
mapboxgl.accessToken = mapToken;


// =======================
// CREATE MAP INSTANCE
// =======================

// Initialize a new map
const map = new mapboxgl.Map({

  // ID of HTML element where map will render
  // <div id="map"></div>
  container: "map",

  // Map style (commented out here)
  // You can use different styles like satellite, streets, etc.
  style: "mapbox://styles/mapbox/standard-satellite",

  // Center of map → [longitude, latitude]
  // Coming from DB (stored using Mapbox geocoding)
  center: listing.geometry.coordinates,

  // Zoom level (higher = closer view)
  zoom: 12,
});


// =======================
// DEBUG: CHECK COORDINATES
// =======================

// Logs coordinates in console
// Example: [78.4867, 17.3850]
console.log(listing.geometry.coordinates);


// =======================
// CREATE MARKER
// =======================

// Create a marker (pin on map)
const marker1 = new mapboxgl.Marker({ color: "red" })

  // Set marker position using same coordinates
  .setLngLat(listing.geometry.coordinates)

  // Attach popup (info box when marker is clicked)
  .setPopup(

    // Create popup with slight offset (distance from marker)
    new mapboxgl.Popup({ offset: 25 })

      // Set HTML content inside popup
      .setHTML(
        `<h4>${listing.title}, ${listing.location}</h4>
         <p>Hello there, location details will be provided after booking</p>`
      )
  )

  // Add marker to map
  .addTo(map);


// =======================
// DEBUG LOG
// =======================

// Simple check to confirm script runs
console.log("check");