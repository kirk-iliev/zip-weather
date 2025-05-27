import { useState, useEffect } from 'react'
import './App.css'
import zipData from './USCities.json'

// Components

function SearchBar({inputValue, setInputValue, setShowSuggestions, onKeyDown}) {
  return (
    <input
      value={inputValue}
      onChange={(e) => {
        const val = e.target.value;
        setInputValue(val);
        setShowSuggestions(/[a-zA-Z]/.test(val) && val.length > 0);
      }}
      placeholder="Enter zip code or city name"
      type="text"
      style={{
        width: '50%',
        maxWidth: '210px',
        minWidth: '200px'
      }}
      onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
      onKeyDown={onKeyDown}
    />
  );
}

function SearchButton({onClick}) {
  return (
    <button onClick={onClick}>
      Search🔎
    </button>
  )
}

function ForecastColumnHourly({hourlyPeriods, hasSearched, forecastTimeZone}) {
  return (
    <div className='forecast-column'>
      {hasSearched && <h3>Hourly Forecast</h3>}
      {hourlyPeriods.length > 0 && (

        hourlyPeriods.slice(0,24).map((period, index) => (
          <div key={index}>
            <p>{
              new Date(period.startTime).toLocaleTimeString([], {
                hour: 'numeric', minute: '2-digit', timeZone: forecastTimeZone})
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
        <div className='right-now-table'>
          <h3>Right Now: {hourlyPeriods[0].shortForecast}</h3>
          {/* create a table with current weather info */}
          <div className='right-now-table-content'>
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
        </div>
      )}
    </div>
  )
}

function CityName({ query }) {
  if (!query) return null;
  return <h2>{query.city}, {query.state}</h2>
}

// Main app component

export default function App() {

  const [detailedPeriods, setDetailedPeriods] = useState([])
  const [hourlyPeriods, setHourlyPeriods] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [cityList, setCityList] = useState([])
  const suggestions = cityList.filter(city => city.city.toLowerCase().includes(inputValue.trim().toLowerCase()))
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [query, setQuery] = useState(null)
  const [forecastTimeZone, setForecastTimeZone] = useState('PST')


  useEffect(() => {
    // Load the zip code data from the JSON file
    setCityList(zipData);
  }, [])

  // Function to get latitude and longitude from zip code
  function getLatLong(inputValue) {
    const trimmedInput = inputValue.trim();
    const isZip = /^\d{3}|\d{4}|\d{5}$/.test(trimmedInput); // Check if input is a valid 3, 4, or 5-digit zip code
    const searchMatch = isZip
      ? zipData.find(zip => zip.zip_code.toString() === trimmedInput)
      : zipData.find(zip => zip.city.toLowerCase() === trimmedInput.toLowerCase());

    console.log(searchMatch)
    if (searchMatch) {
      const lat = searchMatch.latitude
      const long = searchMatch.longitude
      setQuery(searchMatch);
      fetchWeatherData(lat, long)
    } else {
      alert('Unable to find weather data for this location.')
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
        setForecastTimeZone(data.properties.timeZone)
        return Promise.all([
          fetch(forecastSevenDayURL).then((response) => response.json()),
          fetch(forecastHourlyURL).then((response) => response.json()),
        ])
      })
      .then(([dailyData, hourlyData]) => {
        setDetailedPeriods(dailyData.properties.periods)
        setHourlyPeriods(hourlyData.properties.periods)
        setHasSearched(true)
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error)
      })
  }

  function handleSelectSuggestion(zip) {
    const match = zipData.find(z => z.zip_code.toString() === zip);
    if (match) {
      setInputValue(zip);
      setQuery(match);
      setShowSuggestions(false);
      getLatLong(zip);
    }
  }

  return (
    <div className='app-container'>
      <div className='weather-container'>
        <h1>ZipWeather ⛅</h1>
        <div className='search-container'>
          <SearchBar
            setInputValue={setInputValue}
            inputValue={inputValue}
            setShowSuggestions={setShowSuggestions}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                getLatLong(inputValue.toString());
              }
            }}
          />
          {inputValue.length > 0 && suggestions.length > 0 && showSuggestions && (
          <div className="suggestions-dropdown">
            {suggestions.slice(0, 15).map((s, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSelectSuggestion(s.zip_code.toString())}
              >
                {s.city}, {s.state} {s.zip_code}
              </div>
            ))}
          </div>
        )}

        </div>
        <SearchButton onClick={() => getLatLong(inputValue)}/>
        <CityName
          query={query}
        />
        <RightNow
          hourlyPeriods={hourlyPeriods}
        />
        {/* Two-column forecast container */}
        <div className='forecast-container'>
          <ForecastColumnHourly
            hourlyPeriods={hourlyPeriods}
            hasSearched={hasSearched}
            forecastTimeZone={forecastTimeZone}
          />
          <ForecastColumnSevenDay
            detailedPeriods={detailedPeriods}
          />
        </div>
      </div>
    </div>
  )
}
