console.log('js connected');

function startSearch(){
  $('.submitbtn').on('submit', function(event){
    event.preventDefault();
    let searchCity = $('#city-input').val();
    let searchState = $('#state-select').val();
    let searchZip = $('#zipcode-input').val();
    let searchType= $('.type').val();
    
  });

}



