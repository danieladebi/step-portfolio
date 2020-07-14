// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Adds a random greeting to the page.
 */
function addRandomGreeting() {
  const greetings =
      ["I'm a Nigerian-American.", "My favorite sports teams are the Eagles and 76ers.",
      "My favorite color is red.", "I used to play for MIT's football team."];

  // Pick a random greeting.
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Add it to the page.
  const greetingContainer = document.getElementById('greeting-container');
  greetingContainer.innerText = greeting;
}

async function greetingMessage() {
  const response = await fetch('/data'); 
  const text = await response.text();
  document.getElementById("java-message").innerHTML = text;
}

async function getComments() {
  const maxCommentCount = document.getElementById('max-comments').value;
  console.log(`max comment count: ${maxCommentCount}`);

  const response = await fetch(`/data?max-comments=${maxCommentCount}`);
  const commentInfo = await response.json();
  console.log(commentInfo);

  const commentsListElements = document.getElementById('comments-section');

  commentsListElements.innerHTML = '';
  for (let comment of commentInfo["comments"]) {
    console.log(comment)
    commentsListElements.appendChild(createListElement(comment));        
  }

}

async function deleteComments() {
  const params = new URLSearchParams();
  fetch('/delete-data', {method: 'POST', body: params});
  location.reload();
}

function createListElement(text) {
  const liElement = document.createElement('li');
  liElement.innerText = text;
  return liElement;
}

var mitMarker;
var dormMarker; 

var mitLatLng;
var dormLatLng;

var directionsRenderer;
var directionsService;

// Creating map
function createMap() {
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsService = new google.maps.DirectionsService();

  mitLatLng = {lat: 42.3601, lng: -71.0942};
  dormLatLng = {lat: 42.355338, lng: -71.100530};

  const map = new google.maps.Map(document.getElementById('portfolio-map'), {
    center: {
      lat: (mitLatLng.lat+dormLatLng.lat)/2, 
      lng: (mitLatLng.lng+dormLatLng.lng)/2,
    }, 
    mapTypeId: 'terrain',
    zoom: 16,
  }); 

  directionsRenderer.setMap(map);
  renderMap(map);
}

function renderMap(map) {
  mitMarker = new google.maps.Marker({
    position: mitLatLng,
    map: map,
    animation: google.maps.Animation.DROP,
    title: 'MIT (My University)',
  });

  dormMarker = new google.maps.Marker({
    position: dormLatLng,
    map: map,
    animation: google.maps.Animation.DROP,
    title: 'New House',
  });

  campusContentString = "MIT is where I currently go to college." + 
      "<br />It is located in Cambridge, Massachusetts." +
      "<br />This is main campus.";

  dormInfoString = "This is my dorm, New House." +
      "<br />It is about 10 minutes, walking distance," +
      "<br /> away from main campus.";

  var campusInfowindow = new google.maps.InfoWindow({
    content: campusContentString
  });

  var dormInfowindow = new google.maps.InfoWindow({
    content: dormInfoString
  });

  mitMarker.addListener('click', () => {
    campusInfowindow.open(map, mitMarker);
  });

  dormMarker.addListener('click', () => {
    dormInfowindow.open(map, dormMarker);
  });

  directionsService.route(
    {
      origin: dormLatLng, // Dorm.
      destination: mitLatLng, // MIT.
      travelMode: google.maps.TravelMode["WALKING"],
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    });
}

function toggleBounce() {
  if (mitMarker.getAnimation() !== null) {
    mitMarker.setAnimation(null);
  } else {
    mitMarker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

// Charts code
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawCollegeChart);
google.charts.setOnLoadCallback(drawGlobalWarmingChart);

/** Creates a chart and adds it to the page. */
function drawCollegeChart() {
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Category');
  data.addColumn('number', 'Count');
  data.addRows([
      ['Computer Science', 8],
      ['Math', 2],
      ['Physics', 5],
      ['Chemistry', 1],
      ['Other', 3],
  ]);

  const options = {
    'title': 'College Courses I\'ve Taken',
    'width':500,
    'height':350,
    'backgroundColor': 'yellow',
    'titleTextStyle': {
      color: 'black',
      fontSize: 14,
      bold: true,
      italic: false,
    }    
  };

  const chart = new google.visualization.PieChart(
      document.getElementById('college-chart'));
  chart.draw(data, options);
}

async function drawGlobalWarmingChart() {
  const response = await fetch('/global-warming');
  const globalWarmingTemps = await response.json();

  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Year');
  data.addColumn('number', 'Temperatures');

  Object.keys(globalWarmingTemps).forEach((year) => {
    data.addRow([year, globalWarmingTemps[year]]);
  });

  const options = {
    'title': 'Global Warming Temperatures',
    'width': 500,
    'height': 350,
    'backgroundColor': 'white',
    'titleTextStyle': {
      color: 'black',
      fontSize: 14,
      bold: true,
      italic: false,
    }    
  };

  const chart = new google.visualization.LineChart(
      document.getElementById('global-warming-chart'));

  chart.draw(data, options);
}