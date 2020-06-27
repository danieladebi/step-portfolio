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
          ['Other', 3]
        ]);

    const options = {
        'title': 'College Courses I\'ve Taken',
        'width':500,
        'height':350,
        'backgroundColor': 'yellow',
        'titleTextStyle': {color: 'black',
        fontSize: 14,
        bold: true,
        italic: false
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
        'width':500,
        'height':350,
        'backgroundColor': 'white',
        'titleTextStyle': {color: 'black',
            fontSize: 14,
            bold: true,
            italic: false
        }    
    };

    const chart = new google.visualization.LineChart(
        document.getElementById('global-warming-chart'));
    
    chart.draw(data, options);
}

// Creating map
function createMap() {
    const map = new google.maps.Map(
        document.getElementById('portfolio-map'),
        {center: {lat: 42.3601, lng: -71.0942}, zoom: 16}); 
}