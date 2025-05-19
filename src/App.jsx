import { useState } from 'react'
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
  const [detailedPeriods, setDetailedPeriods] = useState([])
  const [hourlyPeriods, setHourlyPeriods] = useState([])
  const [inputValue, setInputValue] = useState('')

  function getLatLong(inputValue) {
    const searchMatch = zipData.find(zips => zips.ZIP.toString() === inputValue.trim())
    console.log(searchMatch)
    if (searchMatch) {
      const lat = searchMatch.LAT
      const long = searchMatch.LNG
      fetchWeatherData(lat, long)
    } else {
      alert('Invalid zip code')
    }
  }

  function fetchWeatherData(lat, long) {
    fetch(`https://api.weather.gov/points/${lat},${long}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data)
        const forecastDetailedURL = data.properties.forecast
        const forecastHourlyURL = data.properties.forecastHourly
        return Promise.all([
          fetch(forecastDetailedURL).then((response) => response.json()),
          fetch(forecastHourlyURL).then((response) => response.json()),
        ])
      })
      .then(([dailyData, hourlyData]) => {
        setWeatherData(dailyData)
        setDetailedPeriods(dailyData.properties.periods)
        setHourlyPeriods(hourlyData.properties.periods)
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
          {/* Split the weather container into two columns
              one for hourly one for 7-day forecast */}
          <div className='forecast-columns'>
            <div className='forecast-column'>

              {weatherData && weatherData.properties && hourlyPeriods && (

                hourlyPeriods.slice(0,24).map((period, index) => (

                  <div key = {index}>
                    <p> {period.startTime.slice(11, 16) + ": " + period.temperature + "° F"} </p>
                    {/* <p> {period.detailedForecast}</p> */}
                    <img src={period.icon}/>
                  </div>
                ))
              )}
            </div>
            <div className='forecast-column'>
              {weatherData && weatherData.properties && detailedPeriods && (
                detailedPeriods.map((period, index) => (
                  <div key = {index}>
                    <h3> {period.name + ": " + period.temperature + "° F"} </h3>
                    <p> {period.detailedForecast}</p>
                    <img src={period.icon}/>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
    </div>
  )
}
