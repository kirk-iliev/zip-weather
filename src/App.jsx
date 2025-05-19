import { useState } from 'react'
import './App.css'
import zipData from './USCities.json'

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
    <button onClick={onClick}>
      Search
    </button>
  )
}

function ForecastColumnHourly({hourlyPeriods}) {
  return (
    <div className='forecast-column'>
      <h3>Hourly Forecast</h3>
      {hourlyPeriods.length > 0 && (
        hourlyPeriods.slice(0,24).map((period, index) => (
          <div key={index}>
            <p>{
              new Date(period.startTime).toLocaleTimeString([], {
                hour: 'numeric', minute: '2-digit'})
                + ": " + period.temperature + "° F"
              }
            </p>
            <p>
              {period.shortForecast}
            </p>
            <img src={period.icon} alt="weather icon"/>
          </div>
        ))
      )}
    </div>
  )
}

function ForecastColumnSevenDay({detailedPeriods}) {
  return (
    <div className='forecast-column'>
      {detailedPeriods.length > 0 && (
        detailedPeriods.map((period, index) => (
          <div key = {index}>
            <h3> {period.name + ": " + period.temperature + "° F"} </h3>
            <p> {period.detailedForecast}</p>
            <img src={period.icon}/>
          </div>
        ))
      )}
    </div>
  )
}

function CityName({ inputValue }) {
  const cityMatch = zipData.find(zips => zips.zip_code.toString() === inputValue.trim())
  if (cityMatch) {
    return (
      <h3>{cityMatch.city}, {cityMatch.state}</h3>
    )
  }
}

export default function App() {

  const [detailedPeriods, setDetailedPeriods] = useState([])
  const [hourlyPeriods, setHourlyPeriods] = useState([])
  const [inputValue, setInputValue] = useState('')

  function getLatLong(inputValue) {
    const searchMatch = zipData.find(zips => zips.zip_code.toString() === inputValue.trim())
    console.log(searchMatch)
    if (searchMatch) {
      const lat = searchMatch.latitude
      const long = searchMatch.longitude
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
        const forecastSevenDayURL = data.properties.forecast
        const forecastHourlyURL = data.properties.forecastHourly
        return Promise.all([
          fetch(forecastSevenDayURL).then((response) => response.json()),
          fetch(forecastHourlyURL).then((response) => response.json()),
        ])
      })
      .then(([dailyData, hourlyData]) => {
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
        <CityName
          inputValue={inputValue}
        />
        <div className='search-container'>
          <SearchBar
            setInputValue={setInputValue}
            inputValue={inputValue}
          />
          <SearchButton onClick={() => getLatLong(inputValue)}/>
        </div>
        {/* Two-column forecast container */}
        <div className='forecast-container'>
          <ForecastColumnHourly
            hourlyPeriods={hourlyPeriods}
          />
          <ForecastColumnSevenDay
            detailedPeriods={detailedPeriods}
          />
        </div>
      </div>
    </div>
  )
}
