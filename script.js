console.log('js connected');

document.addEventListener("DOMContentLoaded", function onDOMLoad() {
  console.log("DOM Loaded");

  const App = initializeApp();

  App.form.element.addEventListener("submit", function(e) {
    e.preventDefault();
    App.form.setValuesFromForm();
    let searchTermObj = App.form.getValues();

    console.log(searchTermObj);
    App.searchMeals.buildUrl(null,searchTermObj);
    let fetchResolved = App.searchMeals.fetch(whenMealFetchResolves);
    function whenMealFetchResolves() {
      App.listFormatter.setJson(App.searchMeals.json);
      App.listFormatter.formatData();
      let result = App.listFormatter.getFormattedData();
      console.log(result);
      App.displayResultsList(result);
    }
  })
});


function initializeApp() {
  function Form(formElement) {
    this.element = formElement;
    this.queries = {
      mainIngredientQuery: null,
      categoryQuery: null,
      cuisineQuery: null
    }
  }
  const formFunctions = {
    setValuesFromForm: function() {
      function assignValueToProp(nameOfProp, CSSselectorOfElement) {
        this.queries[nameOfProp] = document.querySelector(CSSselectorOfElement).value;
      };
      assignValueToProp.call(this,"mainIngredientQuery", "#ingredient-input");
      assignValueToProp.call(this,"categoryQuery", "#category-select");
      assignValueToProp.call(this,"cuisineQuery", "#country-of-origin-select");
    },
    getValues: function() {
      function validateFormInputs(queriesObj) {
        let valueWasEntered = false;
        for(prop in queriesObj) {
          if(queriesObj[prop]) {
            valueWasEntered = true;
          }
        }
        return valueWasEntered;
      }
      let valueWasEntered = validateFormInputs(this.queries);
      if(valueWasEntered) {
        return this.queries;
      } else {
        throw "You must enter something to search";
      }
    }
    }

  function Fetch(baseEndpoint,headers) {
    this.url = baseEndpoint;
    this.headers = headers;
    this.json = null;
    this.isResolved = false;
  }
  const fetchFunctions = {
    fetch: function(callback) {
      console.log(this.url);
      fetch(this.url,this.headers)
      .then(response => {
        if(response.ok) {
          return response.json();
        }
        throw "something went wrong";
      })
      .then(responseJson => {
        this.setJson(responseJson);
        callback();
      })
      .catch(err => new Error(err));
    },
    getJson: function() {
      return this.json;
    },
    setJson: function(json) {
      this.json = json;
    },
    buildUrl: function(mealId,termObj) {
      let searchTerms = "";
      console.log(!mealId);  
      if(!mealId) {
        console.log("mealId is null"); 
        let termArray = [];
        if(termObj.mainIngredientQuery){
          termArray.push(`i=${termObj.mainIngredientQuery}`);
        }
        if(termObj.categoryQuery){
          termArray.push(`c=${termObj.categoryQuery}`);
        }
        if(termObj.cuisineQuery){
          termArray.push(`a=${termObj.cuisineQuery}`);
        }
        searchTerms = termArray.join("&");
        this.url += searchTerms;
        console.log(searchTerms);
      } else {
        searchTerms = mealId;
      this.url += searchTerms;
      }
    },
    getUrl: function() {
      return this.url;
    }
  }
  function FormatList() {
    this.data = null;
    this.formattedOutput = "";
  }
  const formatListFunctions = {
    formatData: function() {
      let stringArray = this.data.meals.map(function(item) { 
        return `<li class="result">
        <h3 class="result__heading">${item.strMeal}</h3>
        <a class="result__link" href="#">
          <img class="result__link__image" src=${item.strMealThumb} alt=${item.strMeal}>
        </a>      
      </li>`;
      });
      this.formattedOutput = stringArray.join(' ');
    },
    getFormattedData: function() {
      return this.formattedOutput;
    },
    getData: function() {
      return this.data;
    },
    setJson: function(json) {
      this.data = json;
    }

  }


  let myForm = new Form(document.querySelector(".form"));
  Object.setPrototypeOf(myForm, formFunctions);

  let myFetch = new Fetch("https://www.themealdb.com/api/json/v1/1/filter.php?",{});
  Object.setPrototypeOf(myFetch, fetchFunctions);

  let myFormatter = new FormatList();
  Object.setPrototypeOf(myFormatter,formatListFunctions);

  return {
    form: myForm,
    searchMeals: myFetch,
    listFormatter: myFormatter,
    displayResultsList: function(string) {
      let resultsList = document.getElementById("js-results-list");
      resultsList.innerHTML = string;
    }   
  }
}
