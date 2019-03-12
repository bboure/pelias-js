/**
 * A fluent interface for forward geocoding in Pelias
 */
import * as Constants from '../constants'
import { URLSearchParams } from "url";
import { search } from '../util/fetch/fetch'
import {isValidString, isNumeric, isValidBoundaryRectangle} from "../util/validate/validate";

interface ISearchObject {
  searchTerm: string
  focusPoint: ICoordinate
  resultsLimit: string
  boundaryCountry: string
  boundaryRectangle: IBoundaryRectangle
}

interface IBoundaryRectangle {
  min_lat: string
  max_lat: string
  min_lon: string
  max_lon: string
}

interface ICoordinate {
  lat: string
  lon: string
}

// Auto-instantiate in case caller forgets 'new' so as not to pollute the global namespace

// TODO: take a formed search object so the use doesn't have to use the fluent setters

class Search {

  private _searchObject

  constructor() {
    this._searchObject = {
      searchTerm: undefined
    }
  }

  // The 'text' param for Pelias
  setSearchTerm = (searchTerm: string) => {
    if(!isValidString(searchTerm)) {
      throw new Error('Search term should be a nonempty string')
    }
    this._searchObject.searchTerm = searchTerm
    return this
  }

  // Set a locale to search near - require both lat and long
  setFocusPoint = (lat: string, long: string) => {
    if(!isNumeric(lat) || !isNumeric(long)) {
      throw new Error('Lat and long values should be numeric floating-point coordinates')
    }
    this._searchObject.focusPoint = {lat: lat, lon: long}
    return this
  }

  // Set a locale to search near - require both lat and long
  setResultsLimit = (limit: number) => {
    if(!Number.isInteger(limit)) {
      throw new Error('Limit should be an integer')
    }
    this._searchObject.resultsLimit = limit
    return this
  }

  // Restrict search to a boundary country
  setBoundaryCountry = (boundaryCountry: string) => {
    if(!isValidString(boundaryCountry)) {
      throw new Error('Boundary country should be a nonempty string')
    }
    this._searchObject.boundaryCountry = boundaryCountry
    return this
  }

  // Restrict search to a boundary country
  setBoundaryRectangle = (boundaryRectangle: any) => {
    if(!isValidBoundaryRectangle(boundaryRectangle)) {
      throw new Error('Boundary rectangle should be an object with keys min_lat, max_lat, min_long, max_long. Values should be floating-point coordinates')
    }
    this._searchObject.boundaryRectangle = boundaryRectangle
    return this
  }

  execute = () => {
    const query = buildSearchQueryString(this._searchObject)
    return search(query).then((response) => {
      return(response)
    })
  }
}

// Search takes a GET request with a variety of query string params
const buildSearchQueryString = (searchObject: ISearchObject) => {
  const paramsArray = []

  if(searchObject.searchTerm) {
    paramsArray.push([Constants.QS_TEXT, searchObject.searchTerm])
  }

  if(searchObject.focusPoint) {
    paramsArray.push([Constants.QS_FOCUS_LAT, searchObject.focusPoint.lat])
    paramsArray.push([Constants.QS_FOCUS_LONG, searchObject.focusPoint.lon])
  }

  if(searchObject.resultsLimit) {
    paramsArray.push([Constants.QS_RESULTS_LIMIT, searchObject.resultsLimit])
  }

  if(searchObject.boundaryCountry) {
    paramsArray.push([Constants.QS_BOUNDARY_COUNTRY], searchObject.boundaryCountry)
  }

  if(searchObject.boundaryRectangle) {
    paramsArray.push([Constants.QS_BOUNDARY_RECT_MIN_LAT, searchObject.boundaryRectangle.min_lat])
    paramsArray.push([Constants.QS_BOUNDARY_RECT_MAX_LAT, searchObject.boundaryRectangle.max_lat])
    paramsArray.push([Constants.QS_BOUNDARY_RECT_MIN_LON, searchObject.boundaryRectangle.min_lon])
    paramsArray.push([Constants.QS_BOUNDARY_RECT_MAX_LON, searchObject.boundaryRectangle.max_lon])
  }

  const searchParams = new URLSearchParams(paramsArray)
    return searchParams.toString()
}

export default Search
