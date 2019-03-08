console.log('js connected');

document.addEventListener("DOMContentLoaded", function onDOMLoad() {
  console.log("DOM Loaded");

  function changeState(newState) {
    const event = new CustomEvent("stateChanged", {
      detail: {
        state: newState
      }
    });
    document.dispatchEvent(event);
  }

  //manages App state and switching of views
  document.addEventListener("stateChanged", function manageViews(e) {
    console.log("change State ran with value " + e.detail.state);
    if(e.detail.state === "search") {
      App.searchViewManager.render(App.searchViewManager.html);
      const form = document.getElementById("js-form");
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        App.searchViewManager.resetObjectProps();
        App.searchViewManager.getValuesFromForm(); 
        if(App.searchViewManager.formInputsValid()) {
            //make fetch
            let url = App.searchViewManager.fetch.buildMealSearchUrl(App.searchViewManager.queries);
            App.searchViewManager.fetch.getData(url,null,afterListFetch);
        } else {
            App.searchViewManager.displaySearchErrorToUser();
        }   
        //prevents execution until list json is available
        function afterListFetch(jsonData) {
          App.resultManager.clearData.call(App.resultManager);
          App.resultManager.setData.call(App.resultManager,jsonData);
          App.resultManager.formatResultData.call(App.resultManager);
          changeState("results");
        }
      });
    } else {}
    if(e.detail.state === "results") {
      App.resultManager.render(App.resultManager.html);
      const resultsList = document.getElementById('result-list');
      resultsList.addEventListener("click", function(e) {
        e.preventDefault();
        console.log(e.target);
      })
    }
  });

  function initializeApp() {
    const ManagerFunctions = {
      render: function(html) {
        let element = document.getElementById("body");
        element.innerHTML = html;

        //must reset menu listeners on render
        function addMenuButtonListeners() {
          let button = document.querySelector("#js-button-li");
          let linksLi = document.querySelector("#js-link-li");
          let searchBtn = document.querySelector("#js-menu-search-button");
          let resultsBtn = document.querySelector("#js-menu-results-button");
          button.addEventListener("click", function() {
            linksLi.classList.toggle("hidden");
          });

          searchBtn.addEventListener("click", function() {
            changeState("search");
          });
          resultsBtn.addEventListener("click", function() {
            changeState("results");
          })
        }
        addMenuButtonListeners();
      },
      fetch: {
        buildMealSearchUrl:function(termObj) {
          //formats the url to be compatable with themealdb api
          let baseEndpoint = "https://www.themealdb.com/api/json/v1/1/filter.php?";
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
          return baseEndpoint + termArray.join("&");
        },
        buildDetailSearchUrl: function(mealId) {
          let baseEndpoint = "https://www.themealdb.com/api/json/v1/1/lookup.php?i="
          return baseEndpoint + String(mealId);
        },
        getData: function(url,headers,callback) {
          fetch(url,headers)
            .then(response => {
              if(response.ok) {
                return response.json();
              }
              throw "something went wrong";
            })
            .then(responseJson => {
              if(callback) {
              callback(responseJson);
              return;
              }
              return responseJson;
            })
            .catch(err => new Error(err));
          }
        }
    }
    function SearchManager() {
      this.html = templates.searchTemplate;
      this.queries = {
        mainIngredientQuery: null,
        categoryQuery: null,
        cuisineQuery: null
      },
        //Event Listener Helper Functions
      this.formInputsValid = function() {
          let queriesObj = this.queries;
          let valueWasEntered = false;
          for(prop in queriesObj) {
            if(queriesObj[prop]) {
              valueWasEntered = true;
            }
          }
          return valueWasEntered;
      },
      this.displaySearchErrorToUser = function() {
        let form = document.querySelector("#js-form");
        //so only one error message is displayed upon multiple clicks.
        if (form.children[0].classList.contains('error-message')) {
          return;
        };
        let errorMessage = document.createElement("div");
        errorMessage.classList.add("error-message");
        errorMessage.textContent = "Please select from the dropdowns or search by main ingredient";
        form.prepend(errorMessage);
      },
      this.getValuesFromForm = function() {
        function assignValueToProp(nameOfProp, CSSselectorOfElement) {
          this.queries[nameOfProp] = document.querySelector(CSSselectorOfElement).value;
        };
        assignValueToProp.call(this,"mainIngredientQuery", "#ingredient-input");
        assignValueToProp.call(this,"categoryQuery", "#category-select");
        assignValueToProp.call(this,"cuisineQuery", "#country-of-origin-select");
      },
      this.resetObjectProps = function() {
        for (let prop in this.queries) {
          this.queries[prop] = null;
        }
      }
      
    }
    function ResultManager() {
      this.data = null;
      this.html = templates.resultTemplate;
      this.listObjects = [];
      this.resultList = "";
      this.formatResultData = function() {
        let stringArray = this.data.map(function(item) { 
          return `<li class="result">
          <h3 class="result__heading">${item.strMeal}</h3>
          <a class="result__link" href="#">
            <img class="result__link__image" src=${item.strMealThumb} alt=${item.strMeal}>
          </a>      
        </li>`;
        });


        let div = document.createElement("div");
        let ul = document.createElement("ul");

        div.classList.add("results-container");
        ul.classList.add("result-list");
        ul.id = "result-list"
        div.appendChild(ul);
        ul.innerHTML = stringArray.join(' ');

        this.html += div.innerHTML;
      };
      this.getFormattedData = function() {
        return this.formattedOutput;
      };
      this.getData = function() {
        return this.data;
      };
      this.setData = function(json) {
        console.log("setData ran");
        this.data = json.meals;
      };
      this.clearData = function() {
        this.data = null;
        this.html = templates.resultTemplate;
      }
    }
    function MenuButton(buttonSelector, linkSelector) {
      this.button = document.querySelector(buttonSelector);
      this.linksLi = document.querySelector(linkSelector);
      this.toggleExpanded = function() {
        this.linksLi.classList.toggle("hidden");  
      }
    }

    let searchViewManager = new SearchManager();
    let resultManager = new ResultManager();
    let menuButton = new MenuButton("#js-button-li","#js-link-li");

    Object.setPrototypeOf(resultManager, ManagerFunctions);
    Object.setPrototypeOf(searchViewManager, ManagerFunctions);


    console.log(resultManager.__proto__);

    return {
      searchViewManager: searchViewManager,
      menuButton: menuButton,
      resultManager: resultManager
    }
  }

  //templates keep collapsed unless you need
  var templates = (function() {
  const searchTemplate = `
  <header class="header" role="banner">
  <nav class="nav" role="navigation">
    <ul class="nav-list">
      <li>
          <h1 class="main-heading">YUM</h1>
      </li>
      <li class="nav-list__item" id="js-button-li">
        <button class="menu-button" id="js-menu-button">Menu</button>
      </li>
    </ul>
    <h2 class="nav__subheading">The world's best recipe search engine</h2>
    <div class="mobile-nav hidden" id="js-link-li">
        <a class="mobile-nav-link" href="#" id="js-menu-search-button">Search</a>
        <a class="mobile-nav-link" href="#" id="js-menu-results-button">Results</a>
    </div>
  </nav>
  </header>
  <main role="main" class="main">
    <p class="form-instructions">Enter at least one filter below</p>
    <form class="form" id="js-form">
      <label class="form__label" for="ingredient-input">Main Ingredient</label>
      <input class="form__text-input" id="ingredient-input" type="text" name="ingredient-input"  aria-label="input search by main ingredient"> 
      <label class="form__label" for="category-select">Category(optional)</label>
      <select class="form__select-input" name="category-select" id="category-select">
        <option value="">Select a Category</option>
          <option value="beef">Beef</option>
          <option value="chicken">Chicken</option>
          <option value="desert">Desert</option>
          <option value="lamb">Lamb</option>
          <option value="miscellaneous">Miscellaneous</option>
          <option value="pasta">Pasta</option>
          <option value="pork">Pork</option>
          <option value="seafood">Seafood</option>
          <option value="side">Side</option>
          <option value="starter">Starter</option>
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>          
      </select>
      <label class="form__label" for="country-of-origin-select">Country of Origin</label>
      <select class="form__select-input location-type" name="country-of-origin" id="country-of-origin-select">
        <option value="">Select A Cuisine</option>
        <optgroup label="North America"><
          <option value="american">American</option>
          <option value="canadian">Canadian</option>
          <option value="jamaican">Jamaican</option>
          <option value="mexican">Mexican</option>
        </optgroup>
        <optgroup label="Europe">
          <option value="british">British</option>
          <option value="dutch">Dutch</option>
          <option value="french">French</option>
          <option value="greek">Greek</option>
          <option value="italian">Italian</option>
          <option value="irish">Irish</option>
          <option value="russian">Russian</option>
          <option value="spanish">Spanish</option>
        </optgroup>
        <optgroup label="Africa">
          <option value="egyptian">Egyptian</option>
          <option value="moroccan">Moroccan</option>
        </optgroup>
        <optgroup label="Asia">
          <option value="chinese">Chinese</option>
          <option value="japanese">Japanese</option>
          <option value="malaysian">Malaysian</option>
          <option value="thai">Thai</option>
          <option value="vietnamese">Vietnamese</option>
        </optgroup>
        <optgroup label="Unknown">
          <option value="unknown">Unknown Origin</option>
        </optgroup>
      </select>
      <input class="submit-btn" type="submit" aria-label="submit" value="Search"></input>
    </form>
  </main>`;
  
  const resultTemplate = `
  <header class="header" role="banner">
  <nav class="nav" role="navigation">
    <ul class="nav-list">
      <li>
          <h1 class="main-heading">YUM</h1>
      </li>
      <li class="nav-list__item" id="js-button-li">
        <button class="menu-button" id="js-menu-button">Menu</button>
      </li>
    </ul>
    <h2 class="nav__subheading">The world's best recipe search engine</h2>
    <div class="mobile-nav hidden" id="js-link-li">
        <a class="mobile-nav-link" href="#" id="js-menu-search-button">Search</a>
        <a class="mobile-nav-link" href="#" id="js-menu-results-button">Results</a>
    </div>
  </nav>
  </header>
  `;

return {
  searchTemplate: searchTemplate,
  resultTemplate: resultTemplate
}
  })();
  const App = initializeApp();
  changeState("search");
});