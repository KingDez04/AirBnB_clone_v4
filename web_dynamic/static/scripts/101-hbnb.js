$(document).ready(function() {
    // Variable to store selected amenity IDs
    const selectedAmenities = [];
  
    // Variable to store selected state IDs (assuming a dictionary)
    const selectedStates = {};
  
    // Variable to store selected city IDs (assuming a dictionary)
    const selectedCities = {};
  
    // Listen for changes on all amenity, state, and city checkboxes
    $('.amenities input[type="checkbox"], .locations input[type="checkbox"]').change(function() {
      const type = $(this).parent().parent().attr('class'); // Get parent class (amenities or locations)
      const id = $(this).data('id'); // Get state/city/amenity ID
      const name = $(this).data('name'); // Get state/city/amenity name
  
      if ($(this).is(':checked')) {
        if (type === 'amenities') {
          // Add amenity ID to the list if checkbox is checked
          selectedAmenities.push(id);
        } else if (type === 'locations') {
          // Add state/city ID to the dictionary with name as key
          if ($(this).parent().parent().is('li:first-child')) { // Check if it's a state
            selectedStates[name] = id;
          } else {
            selectedCities[name] = id;
          }
        }
      } else {
        if (type === 'amenities') {
          // Remove amenity ID from the list if checkbox is unchecked
          const index = selectedAmenities.indexOf(id);
          if (index > -1) {
            selectedAmenities.splice(index, 1);
          }
        } else if (type === 'locations') {
          // Remove state/city ID from the dictionary
          if ($(this).parent().parent().is('li:first-child')) {
            delete selectedStates[name];
          } else {
            delete selectedCities[name];
          }
        }
      }
  
      // Update h4 tag with the list of selected locations (states and cities)
      let selectedLocations = "";
      const selectedLocationsList = [];
      for (const stateName in selectedStates) {
        selectedLocationsList.push(stateName);
      }
      for (const cityName in selectedCities) {
        selectedLocationsList.push(cityName);
      }
      if (selectedLocationsList.length > 0) {
        selectedLocations = `(${selectedLocationsList.join(', ')})`;
      }
      $('.locations h4').text(selectedLocations);
    });
  
    // Check API status on document ready
    $.ajax({
      url: "http://0.0.0.0:5001/api/v1/status",
      success: function(data) {
        if (data.status === "OK") {
          $("#api_status").addClass("available");
        } else {
          $("#api_status").removeClass("available");
        }
      },
      error: function() {
        console.error("Error fetching API status");
        // Optionally add a class or message indicating error
      }
    });
  
    // Fetch places on search button click
    $('.filters button').click(function() {
      // Prepare data object with selected amenity, state, and city IDs
      const data = {
        amenities: selectedAmenities,
        states: selectedStates,
        cities: selectedCities,
      };
  
      $.ajax({
        url: "http://0.0.0.0:5001/api/v1/places_search",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data), // Include all selected data
        success: function(data) {
          // Clear existing place elements before adding new ones
          $('.section.places').empty();
  
          for (const place of data) {
            // Create article element for each place
            const article = $('<article>');
  
          // Create title_box div
          const titleBox = $('<div class="title_box">');
          titleBox.append(`<h2>${place.name}</h2>`);
          titleBox.append(`<div class="price_by_night">${place.price_by_night}</div>`);
          article.append(titleBox);
  
          // Create information div
          const information = $('<div class="information">');
          information.append(`<div class="max_guest">${place.max_guest} Guest${place.max_guest !== 1 ? 's' : ''}</div>`);
          information.append(`<div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms !== 1 ? 's' : ''}</div>`);
          information.append(`<div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms !== 1 ? 's' : ''}</div>`);
          article.append(information);
  
          // Create description div (without Owner)
          const description = $('<div class="description">');
          description.text(place.description);
          article.append(description);
  
            // Append the article to the places section
            $('.section.places').append(article);
          }
        },
        error: function() {
          console.error("Error fetching places");
          // Optionally add a message indicating error loading places
        }
      });
    });
  });