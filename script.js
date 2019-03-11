document.addEventListener("DOMContentLoaded", function onDOMLoad() {

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
        function afterListFetch(data) {
          console.log(data);
          App.resultManager.clearData.call(App.resultManager);
          App.resultManager.setData.call(App.resultManager,data);
          App.resultManager.formatResultData.call(App.resultManager);
          changeState("results");
        }
      });
    } else {}
    if(e.detail.state === "results") {
      App.resultManager.render(App.resultManager.html);
      const resultList = document.getElementById('result-list');
      resultList.addEventListener("click", function(e) {
        e.preventDefault();
        console.log(e.target);
        let mealId;
        const clickedElement = e.target;
        const mealIdAttribute = "data-meal-id";

        //find data-meal-id so only one event listener needs to be used on
        //resultList.
        if(clickedElement.hasAttribute(mealIdAttribute)) {
          mealId = e.target.getAttribute(mealIdAttribute);
        } else if(clickedElement.parentNode.hasAttribute(mealIdAttribute)) {
          mealId = clickedElement.parentNode.getAttribute(mealIdAttribute);
        } else if(clickedElement.parentNode.parentNode.hasAttribute(mealIdAttribute)) {
          mealId = clickedElement.parentNode.parentNode.getAttribute(mealIdAttribute);
        } else {
          mealId = null;
        };
        
        const url = App.resultManager.fetch.buildDetailSearchUrl(mealId);
        let mealJson = fetch(url)
                      .then(response => response.json())
                      .then(responseJson => {
                        App.detailManager.clearData();
                        App.detailManager.setJson(responseJson);
                        console.log(App.detailManager.data);
                        App.detailManager.formatDetailData();                     
                        changeState("detail");
                      })
                      .catch(err => {
                        App.resultManager.render(App.resultManager.searchErrorHtml);
                      });
      });
    }
    if(e.detail.state === "detail") {
      App.detailManager.render(App.detailManager.html);
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
          return `<li class="result" data-meal-id=${item.idMeal}>
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
        this.data = json.meals;
      };
      this.clearData = function() {
        this.data = null;
        this.html = templates.resultTemplate;
      }
    }
    function DetailManager() {
      this.data = null;
      this.html = templates.resultTemplate;
      this.setJson = function(json) {
        this.data = json.meals[0];
      }
      this.formatDetailData = function() {
      
        const createInstructionsTemplate = ()=> {
          let instructions = this.data.strInstructions.split(".");
          const formattedInstructions = instructions.map(function(item) {
            if(item) {
              return `<li class="instruction__list__item"><span class="list-item-number">${instructions.indexOf(item) + 1}.</span>${item}</li>`;
            }
          });
          return formattedInstructions.join(" ");
        }
        const createIngredientsTemplate = ()=> {
          let ingredientArray = [];
          for(let i=0; i <= 20; i++) {
            let ingredientStr = `strIngredient${i}`;
            let measureStr = `strMeasure${i}`;
            if(this.data[ingredientStr] && this.data[measureStr]) {
              let string = `<li class="ingredient__list__item">${this.data[measureStr]} ${this.data[ingredientStr]}</li>`;
              ingredientArray.push(string);
            }
          }
          return ingredientArray.join(" ");
        }
        let instructionsTemplate = createInstructionsTemplate();
        let ingredientsTemplate = createIngredientsTemplate();
        const formattedHtml = `
        <div class="lightbox-backdrop">
          <div id="detail-container" class="lightbox detail-container card">
            <h1 class="detail__heading">${this.data.strMeal}</h1>
      
            <img class="detail__image" src=${this.data.strMealThumb} alt="">
            <section class="ingredients">
              <div class="sub-heading-container js-ingredients">
                <h4 class="detail__sub-heading">Ingredients</h4>
              </div>
              <ul class="ingredient__list js-ingredient__list">
                ${ingredientsTemplate}
              </ul>
            </section>
            <section class="instructions">
              <div class="sub-heading-container js-instructions">
                <h4 class="detail__sub-heading">Instructions</h4>
              </div>
              <ol class="instruction__list js-instruction__list">
                ${instructionsTemplate}
              </ol>
            </section>
          </div>
        </div>
        <script src="script.js"></script>`

        console.log(instructionsTemplate);
        console.log(ingredientsTemplate);
        this.html += formattedHtml; 
      }
      this.clearData = function() {
        this.data = null;
        this.html = templates.resultTemplate;
      }
      //TODO Finish collapsing menu feature for mobile
      this.addCollapsableSections = function() {
        const ingredientsTab = document.querySelector("js-ingredients");
        const instructionsTab = document.querySelector("js-instructions");
        const ingredientsList = docuemnt.querySelector("js-ingredient__list");
        const instructionsList = docuemnt.querySelector("js-instructions__list");

        ingredientsTab.addEventListener("click", function instructionsClickHandler(e) {
          console.log("ing clicked");
          ingredientsList.classList.toggle("hidden");
        });

        instructionsTab.addEventListener("click", function instructionsTabClickHandler() {
          
          instructionsList.classList.toggle("hidden");
        })
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
    let detailManager = new DetailManager();
    let menuButton = new MenuButton("#js-button-li","#js-link-li");


    Object.setPrototypeOf(resultManager, ManagerFunctions);
    Object.setPrototypeOf(searchViewManager, ManagerFunctions);
    Object.setPrototypeOf(detailManager, ManagerFunctions);

    return {
      searchViewManager: searchViewManager,
      menuButton: menuButton,
      resultManager: resultManager,
      detailManager: detailManager
    }
  }

  function changeState(newState) {
    const event = new CustomEvent("stateChanged", {
      detail: {
        state: newState
      }
    });
    document.dispatchEvent(event);
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