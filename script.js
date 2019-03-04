console.log('js connected');

function startSearch(){
  $('.form-input').on('submit', function(event){
    event.preventDefault();
    let searchCity = $('#city-input').val();
    let searchState = $('#state-select').val();
    let searchZip = $('#zipcode-input').val();
    let locationType= $('.typeofplace').val();

    let formattedQuery = formatQuery(locationType,searchCity,searchState,searchZip);
    let resultsJson = getLocations(formattedQuery);
    console.log('startSearch ran');
  });
}

function formatQuery(locationType,...args) {
    let baseEndpoint = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search"
    let filteredArgs = args.filter((item) => {if (item !== "") {return item}});
    let searchQuery = encodeURIComponent(filteredArgs.join(' '));
    let formattedQuery = `${baseEndpoint}?location=${searchQuery}&categories=${locationType}`;
    console.log(formattedQuery);  
    return formattedQuery;
}

function getLocations(seachQuery) {
    let header = new Headers();
    header.append("Authorization", "Bearer xIv0uKoLBvYlWMNctGn5vkjf8dcz-Qi0OqTFSMtOmK8GXiw8atmJIbpNbEyAwd2CGeESdgh-RHOs12SySQUiZlIl3Ilv7Cy2F_APfJu07wnZELHuTXyXscSAzed6XHYx");

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
  console.log(businessArray);
  

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

  console.log(resultInfoObj);

  let element = `<li>
  <ul> 
    <li>${resultInfoObj.name}</li>
    <li>${resultInfoObj.address}</li>
    <li>${resultInfoObj.phone}</li>
    <li>
      <img src=${resultInfoObj.imageUrl}>
    </li>
    <li>
      <a href=${resultInfoObj.webUrl}>Check their website out.</a>
    </li>
  </ul>
  </li>`;

  return element;

};



$(startSearch());




