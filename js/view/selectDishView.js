import {totalCostOfDish} from "../model/dinnerModel";
import {View} from "./view";
import {createDishThumbnail} from "../components/dishThumbnail";
import * as Rx from "rxjs";

/** MenuView Object constructor
 *
 * This object represents the code for one specific view (in this case the Example view).
 *
 * It is responsible for:
 * - constructing the view (e.g. if you need to create some HTML elements procedurally)
 * - populating the view with the data
 * - updating the view when the data changes
 *
 * You should create a view Object like this for every view in your UI.
 *
 * @param {jQuery object} container - references the HTML parent element that contains the view.
 * @param {Object} model - the reference to the Dinner Model
 */
export class SelectDishView extends View {

    constructor(containerElement, model) {
        super(containerElement);
        this._dishList = containerElement.querySelector("ul.dish-thumbnail-list");
        this._searchForm = containerElement.querySelector(".select-dish-search-form input[type=text]");
        this._typeSelect = containerElement.querySelector(".select-dish-search-form select");

        this._searchTextObservable = Rx.Observable.fromEvent(this._searchForm, 'input')
            .map(event => event.srcElement.value);
        this._typeObservable = Rx.Observable.fromEvent(this._typeSelect, 'change')
            .map(event => event.srcElement.value);

        let initiateSearch =
            this._searchTextObservable
                .throttleTime(500)
                .startWith("")
                .combineLatest(
            this._typeObservable
                .startWith("all"),
            (search, type) => ({search:search, type: type})
        );

        let dishesObservable = initiateSearch.flatMap(({search, type}) =>
            Rx.Observable.fromPromise(model.filteredDishes(type, search)));

        dishesObservable.subscribe(dishes => this.render(dishes));
    }

    render(dishes) {
        this.dishList = dishes;
    }

    get locationHash() {
        return "#select-dish";
    }

    get searchTextObservable() {
        return this._searchTextObservable;
    }

    get typeSelectObservable() {
        return this._typeObservable
    }

    set dishList(newList) {
        this._dishList.innerHTML = "";
        newList.forEach(dish => {

            this._dishList.appendChild(createDishThumbnail({document: document, title:dish.name, dishID:dish.id, imageURL:dish.image, cost: dish.price}))
        });
    }

}