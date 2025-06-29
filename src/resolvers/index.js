import Resolver from '@forge/resolver';
import { fetch } from '@forge/api'

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);

  return 'Hello, world!';
});

resolver.define('getLocationCoordinates', async (req) => {

  if(req.payload.location) {
    const config = req.payload.location;
    const url = "https://api.openweathermap.org/geo/1.0/direct?q=" + config.city + "," + config.country + "&limit=5&appid=" + process.env.OPENWEATHER_KEY;
    const response = await fetch(url)
    if(!response.ok) {
      const errmsg = `Error from Open Weather Map Geolocation API: ${response.status} ${await response.text()}`;
      console.error(errmsg)
      throw new Error(errmsg)
    }
    const locations = await response.json()
    return locations;
  } else {
    return null;
  }
});

resolver.define('getCurrentWeather', async (req) => {

console.log(req.context.extension.gadgetConfiguration)

  if(req.context.extension.gadgetConfiguration) {
    const config = req.context.extension.gadgetConfiguration;
    const units = config.units || 'metric'; // Default to metric if not specified
    const url = "https://api.openweathermap.org/data/2.5/weather?lat=" + config.lat + "&lon=" + config.lon +"&units=" + units + "&appid=" + process.env.OPENWEATHER_KEY;
    const response = await fetch(url)
    if(!response.ok) {
      const errmsg = `Error from Open Weather Map Current Weather API: ${response.status} ${await response.text()}`;
      console.error(errmsg)
      throw new Error(errmsg)
    }
    const weather = await response.json()
    return weather;
  } else {
    return null;
  }
  
});

resolver.define('getForecastWeather', async (req) => {

console.log(req.context.extension.gadgetConfiguration)

  if(req.context.extension.gadgetConfiguration) {
    const config = req.context.extension.gadgetConfiguration;
    const units = config.units || 'metric'; // Default to metric if not specified
    const url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + config.lat + "&lon=" + config.lon +"&units=" + units + "&appid=" + process.env.OPENWEATHER_KEY;
    const response = await fetch(url)
    if(!response.ok) {
      const errmsg = `Error from Open Weather Map Forecast API: ${response.status} ${await response.text()}`;
      console.error(errmsg)
      throw new Error(errmsg)
    }
    const forecast = await response.json()
    return forecast;
  } else {
    return null;
  }
  
});

export const handler = resolver.getDefinitions();