console.log('js connected');

function startSearch(){
  $('.form').on('submit', function(event){
    event.preventDefault();
    let searchCity = $('#city-input').val();
    let searchState = $('#state-select').val();
    let searchZip = $('#zipcode-input').val();
    let locationType = $('.location-type').val();

    let formattedQuery = formatQuery(locationType,searchCity,searchState,searchZip);
    let resultsJson = getLocations(formattedQuery);
    console.log('startSearch ran');
  });
}

function formatQuery(locationType,...args) {
    let baseEndpoint = "https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken%20breast"
    let filteredArgs = args.filter((item) => {if (item !== "") {return item}});
    let searchQuery = encodeURIComponent(filteredArgs.join(' '));
    let formattedQuery = `${baseEndpoint}?location=${searchQuery}&categories=${locationType}`;
    console.log(formattedQuery);  
    return formattedQuery;
}

function getLocations(seachQuery) {
    let header = new Headers();
    header.append("Authorization", "Bearer xIv0uKoLBvYlWMNctGn5vkjf8dcz-Qi0OqTFSMtOmK8GXiw8atmJIbpNbEyAwd2CGeESdgh-RHOs12SySQUiZlIl3Ilv7Cy2F_APfJu07wnZELHuTXyXscSAzed6XHYx");
    header.append("mode", "no-cors");
    let options = {
      headers: header
    };

    fetch(seachQuery,options)
    .then(function(response) {
      if(response.ok){
        return response.json();
      }
      throw 'response not 200';      
    })
    .then(function(responseJson) {
      console.log(responseJson);
      displayResults(responseJson);
    })
    .catch(error => new Error(error));
}

function displayResults(responseJson) {
  let $resultsUl = $(".results-list");

  let businessArray = responseJson.businesses;
  

  let elementArray = businessArray.map((item) => {

    let resultInfoObj = {
      name: item.name,
      address: item.location.display_address.join(' '),
      phone: item.display_phone,
      imageUrl: item.image_url,
      webUrl: item.url
    };


    let element = createResultItem(resultInfoObj);
    return element;
  }); 

  $resultsUl.html(elementArray);
}

function createResultItem(resultInfoObj) {


  let element = `<li class="result-item">
  <ul class="result-item-list"> 
    <li class="result-item__heading">${resultInfoObj.name}</li>
    <li class="result-item__address">${resultInfoObj.address}</li>
    <li class="result-item__phone">${resultInfoObj.phone}</li>
    <li>
    <a href=${resultInfoObj.webUrl}>
      <img src=${resultInfoObj.imageUrl}>
    </a>
    </li>
    <li>
      <a class="result-item__link" href=${resultInfoObj.webUrl}>View Yelp Page</a>
    </li>
  </ul>
  </li>`;

  return element;

};



$(startSearch());


fetch('https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken%20breast')
.then(response => response.json())
.then(responseJson => console.log(responseJson))
.catch(error => new Error(error));

