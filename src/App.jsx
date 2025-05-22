import { useState } from 'react'
import './App.css'
import zipData from './USCities.json'

// Components

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

function ForecastColumnHourly({hourlyPeriods, hasSearched}) {
  return (
    <div className='forecast-column'>
      {hasSearched && <h3>Hourly Forecast</h3>}
      {hourlyPeriods.length > 0 && (

        hourlyPeriods.slice(0,24).map((period, index) => (
          <div key={index}>
            <p>{
              new Date(period.startTime).toLocaleTimeString([], {
                hour: 'numeric', minute: '2-digit'})
              }
            </p>
            <p>
              {period.temperature}° F ~ {period.shortForecast}
            </p>
            <img src={period.icon} alt="weather icon"/>
          </div>
        ))
      )}
    </div>
  )
}

function ForecastColumnSevenDay({detailedPeriods, hasSearched}) {
  return (
    <div className='forecast-column'>
      {hasSearched && <h3>7-Day Forecast</h3>}
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

function RightNow({hourlyPeriods}) {

  return (
    <div className='right-now'>
      {hourlyPeriods.length > 0 && (
        <div>
          <h3>Right Now: {hourlyPeriods[0].shortForecast}</h3>
          {/* create a table with current weather info */}
          <table>
            <tbody>
              <tr>
                <td>Temperature:</td>
                <td>{hourlyPeriods[0].temperature}° F</td>
              </tr>
              <tr>
                <td>Wind:</td>
                <td>{hourlyPeriods[0].windSpeed} {hourlyPeriods[0].windDirection}</td>
              </tr>
              <tr>
                <td>Humidity:</td>
                <td>{hourlyPeriods[0].relativeHumidity.value + "%"}</td>
              </tr>
              <tr>
                <td>Chance of rain:</td>
                <td>{hourlyPeriods[0].probabilityOfPrecipitation.value + "%"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CityName({ currentCity }) {
  const cityMatch = zipData.find(zips => zips.zip_code.toString() === currentCity.trim())
  if (cityMatch) {
    return (
      <h3>{cityMatch.city}, {cityMatch.state}</h3>
    )
  }
  return null
}

// Main app component

export default function App() {

  const [detailedPeriods, setDetailedPeriods] = useState([])
  const [hourlyPeriods, setHourlyPeriods] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [currentCity, setCurrentCity] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Function to get latitude and longitude from zip code
  function getLatLong(inputValue) {
    const searchMatch =
      zipData.find(zips => zips.zip_code.toString() === inputValue.trim())
    console.log(searchMatch)
    if (searchMatch) {
      const lat = searchMatch.latitude
      const long = searchMatch.longitude
      fetchWeatherData(lat, long)
    } else {
      alert('Invalid zip code')
    }
  }

  // Function to fetch weather data from weather.gov API points endpoint
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
        setHasSearched(true)
        setCurrentCity(inputValue.trim())
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error)
      })
  }

  return (

    <div className='app-container'>
      <div className='weather-container'>
        <h1>Weather</h1>

        <div className='search-container'>
          <SearchBar
            setInputValue={setInputValue}
            inputValue={inputValue}
          />
          <SearchButton onClick={() => getLatLong(inputValue)}/>
        </div>
          <CityName
            currentCity={currentCity}
          />
          <RightNow
            hourlyPeriods={hourlyPeriods}
          />
        {/* Two-column forecast container */}
        <div className='forecast-container'>
          <ForecastColumnHourly
            hourlyPeriods={hourlyPeriods}
            hasSearched={hasSearched}
          />
          <ForecastColumnSevenDay
            detailedPeriods={detailedPeriods}
          />
        </div>
      </div>
    </div>
  )
}
