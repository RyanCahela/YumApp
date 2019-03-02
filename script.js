console.log('js connected');

function startSearch(){
  $('.submitbtn').on('submit', function(event){
    event.preventDefault();
    let searchCity = $('#city-input').val();
    let searchState = $('#state-select').val();
    let searchZip = $('#zipcode-input').val();
    let searchType= $('.type').val();
    return (checkError())
  });
}
function checkError(){
  if (searchType === '' || searchState && seachZip===''){
    throw 'you must check one box';
  }
  else {
    return (whateverFunction());
  }
}


