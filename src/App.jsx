import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import zipData from './zipcodes.json'

function SearchBar({inputValue, setInputValue}) {
  return (
    <input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Enter zip code"
      type="text"
    />
  );
}

function SearchButton({onClick}) {
  return (
    <button
      onClick={onClick}
    >Search</button>
  )
}

export default function App() {

  const [weatherData, setWeatherData] = useState(null)
  const [periods, setPeriods] = useState([])
  const [inputValue, setInputValue] = useState('')

  function getLatLong(inputValue) {
    fetch(`https://api.zippopotam.us/us/${inputValue}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      //.then((response) => response.json())
      .then((response) => {
        const lat = response.places[0].latitude
        const long = response.places[0].longitude
        fetchWeatherData(lat, long)
      })
      .catch((error) => {
        console.error('Error fetching location data:', error)
      })
  }

  function fetchWeatherData(lat, long) {
    fetch(`https://api.weather.gov/points/${lat},${long}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        const forecastURL = data.properties.forecast
        return fetch(forecastURL)
      })
      .then((response) => response.json())
      .then((forecastData) => {
        setWeatherData(forecastData)
        setPeriods(forecastData.properties.periods)
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error)
      })
  }
  return (

    <div className='app-container'>
        <div className='weather-container'>
          <h1>Weather</h1>
          <div className='zip-search'>
            <SearchBar
              setInputValue={setInputValue}
              inputValue={inputValue}
            />
            <SearchButton onClick={() => getLatLong(inputValue)}/>
          </div>
          {weatherData && weatherData.properties && periods && (
            periods.map((period, index) => (
              <div key = {index}>
                <h3> {period.name + ": " + period.temperature + "° F"} </h3>
                <p> {period.detailedForecast}</p>
                <img src={period.icon}/>
              </div>
            ))
          )}
        </div>
    </div>
  )
}
