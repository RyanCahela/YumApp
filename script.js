console.log('js connected');

let citySearch = "los Angeles"
let stateSearch = "california"
let zipSearch = ""

let locationType = "brewpubs"


function formatQuery(locationType,...args) {
    let baseEndpoint = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search"
    let filteredArgs = args.filter((item) => {if (item !== "") {return item}});
    let searchQuery = encodeURIComponent(filteredArgs.join(' '));
    let formattedQuery = `${baseEndpoint}?location=${searchQuery}&categories=${locationType}`;  
    console.log(formattedQuery)
    getLocations(formattedQuery);
}

var myHeaders = new Headers();
myHeaders.append("Authorization","Bearer xIv0uKoLBvYlWMNctGn5vkjf8dcz-Qi0OqTFSMtOmK8GXiw8atmJIbpNbEyAwd2CGeESdgh-RHOs12SySQUiZlIl3Ilv7Cy2F_APfJu07wnZELHuTXyXscSAzed6XHYx")

console.log(myHeaders);
console.log(myHeaders.get('Authorization'));

let options = {
    headers: myHeaders
};

console.log(options);

function getLocations(seachQuery) {
    fetch(seachQuery,options)
    .then(function(response) {return response.json()})
    .then(function(responseJson) {displayResults(responseJson)})
    .catch(error => {throw 'something went worng'});
}

function displayResults(responseJson) {
    console.log(responseJson);
}


