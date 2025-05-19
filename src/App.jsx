import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'

export default function App() {

  const [weatherData, setWeatherData] = useState(null)
  const [periods, setPeriods] = useState([])

  useEffect(() => {
    fetchWeatherData()
  }, []);

  function fetchWeatherData() {
    fetch('https://api.weather.gov/gridpoints/MTR/87,122/forecast')
      .then((response) => response.json())
      .then((data) => {
        setWeatherData(data)
        console.log(data)
        setPeriods(data.properties.periods)
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error)
      })
  }
  return (

    <div className='app-container'>
      <h1>Weather</h1>
        <div className='weather-container'>
          {weatherData && weatherData.properties && periods && (
            periods.map((period, index) => (
              <div key = {index}>
                <h3> {period.name} </h3>
                <p> {period.detailedForecast}</p>
                <img src={period.icon}/>
              </div>
            ))
          )}
        </div>
    </div>
  )
}
