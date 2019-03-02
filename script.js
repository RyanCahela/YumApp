console.log('js connected');

let citySearch = "los Angeles"
let stateSearch = "california"
let zipSearch = ""

let locationType = "brewpubs"


function formatQuery(locationType,...args) {
    let baseEndpoint = "https://api.yelp.com/v3/businesses/search"
    let filteredArgs = args.filter((item) => {if (item !== "") {return item}});
    let searchQuery = encodeURIComponent(filteredArgs.join(' '));
    let formattedQuery = `${baseEndpoint}?location=${searchQuery}&categories=${locationType}`;  
    console.log(formattedQuery)
    getLocations(formattedQuery);
}


function getLocations(seachQuery) {
    fetch(seachQuery,{
        Bearer: "xIv0uKoLBvYlWMNctGn5vkjf8dcz-Qi0OqTFSMtOmK8GXiw8atmJIbpNbEyAwd2CGeESdgh-RHOs12SySQUiZlIl3Ilv7Cy2F_APfJu07wnZELHuTXyXscSAzed6XHYx"
    })
    .then(function(response) {return response.json()})
    .then(function(responseJson) {displayResults(responseJson)})
    .catch(error => {throw 'something went worng'});
}

function displayResults(responseJson) {
    console.log(responseJson);
}


