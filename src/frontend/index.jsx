import React, {useEffect, useState} from "react";
import ForgeReconciler, { Text, useProductContext, Textfield, Form, Button, FormSection, FormFooter, Label, RequiredAsterisk, useForm, RadioGroup, ErrorMessage, Box, Inline, xcss, Heading, Strong, Image, Stack } from "@forge/react";
import { invoke, view } from "@forge/bridge";

let currentCC = null;

export const Edit = () => {
  const { handleSubmit, register, getValues, formState } = useForm();
  const [locationOptions, setLocationOptions] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const { errors } = formState;

  const unitOptions = [
    { name: "units", label: "Celsius", value: "metric" },
    { name: "units", label: "Fahrenheit", value: "imperial" }
  ];

  const getOptions = () => {
    const values = getValues();

    if(values.city && values.country){

      if(currentCC && (currentCC.city == values.city)&&(currentCC.country == values.country)) {
      } else {
        currentCC = { 
          city: values.city, 
          country: values.country }
      
        invoke('getLocationCoordinates', {location: values}).then((val) => { 
          setLocationOptions(val);
          setShowOptions(true);
        });
      }
    }
  };

  const configureGadget = (data) => {
    const selectedLocation = locationOptions[data.location];
    const configData = {
      ...selectedLocation,
      units: data.units || 'metric'
    };
    view.submit(configData);
  }

  function locationOption(obj, index, array) {
    return { name: "location", label: obj.name + ", " + obj.state + ", " + obj.country, value: index }
  }

  const formContainerStyle = xcss({
    padding: 'space.300',
    borderRadius: 'border.radius.200',
    backgroundColor: 'color.background.neutral.subtle',
    boxShadow: 'elevation.shadow.raised'
  });

  return (
    <Box xcss={formContainerStyle}>
      <Form onSubmit={handleSubmit(configureGadget)}>
        <FormSection>
          <Heading as="h3">🌍 Location Settings</Heading>
          <Label>City<RequiredAsterisk /></Label>
          <Textfield {...register("city", { required: true, onChange: getOptions() })} />
          <Label>Country<RequiredAsterisk /></Label>
          <Textfield {...register("country", { required: true })} />
          {showOptions && <Label>Select your location<RequiredAsterisk /></Label>}
          {showOptions && (
              <RadioGroup {...register("location", {required: true})} options={locationOptions.map(locationOption)}/>
            )}
            {errors["location"] && <ErrorMessage>Select a location</ErrorMessage>}
        </FormSection>
        
        <FormSection>
          <Heading as="h3">📏 Measurement Units</Heading>
          <Label>Select units<RequiredAsterisk /></Label>
          <RadioGroup {...register("units", {required: true})} options={unitOptions}/>
          {errors["units"] && <ErrorMessage>Select measurement units</ErrorMessage>}
        </FormSection>
        
        <FormFooter>
          {showOptions && <Button appearance="primary" type="submit">
            Submit
          </Button>}
        </FormFooter>
      </Form>
    </Box>
  );
};

const View = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const context = useProductContext();

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      try {
        const [currentWeather, forecastWeather] = await Promise.all([
          invoke('getCurrentWeather'),
          invoke('getForecastWeather')
        ]);
        setWeather(currentWeather);
        setForecast(forecastWeather);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Enhanced styling with Material UI aesthetics
  const mainContainerStyle = xcss({
    padding: 'space.300',
    backgroundColor: 'color.background.discovery',
    borderRadius: 'border.radius.200',
    boxShadow: 'elevation.shadow.raised'
  });

  const headerStyle = xcss({
    padding: 'space.200',
    marginBottom: 'space.200',
    borderRadius: 'border.radius.200',
    backgroundColor: 'color.background.neutral.subtle',
    boxShadow: 'elevation.shadow.overlay'
  });

  const currentWeatherCardStyle = xcss({
    padding: 'space.250',
    marginBottom: 'space.300',
    borderRadius: 'border.radius.200',
    backgroundColor: 'color.background.neutral.subtle',
    boxShadow: 'elevation.shadow.overlay'
  });

  const forecastContainerStyle = xcss({
    padding: 'space.200',
    borderRadius: 'border.radius.200',
    backgroundColor: 'color.background.neutral.subtle',
    boxShadow: 'elevation.shadow.overlay'
  });

  const forecastCardStyle = xcss({
    padding: 'space.150',
    marginRight: 'space.100',
    borderRadius: 'border.radius.200',
    backgroundColor: 'color.background.neutral',
    boxShadow: 'elevation.shadow.raised',
    minWidth: '120px',
    textAlign: 'center'
  });

  const configInfoStyle = xcss({
    padding: 'space.200',
    marginBottom: 'space.200',
    borderRadius: 'border.radius.200',
    backgroundColor: 'color.background.neutral.subtle',
    boxShadow: 'elevation.shadow.overlay'
  });

  const getUnitSymbols = () => {
    const config = context?.extension?.gadgetConfiguration;
    const units = config?.units || 'metric';
    return {
      temp: units === 'metric' ? '°C' : '°F',
      speed: units === 'metric' ? 'm/s' : 'mph'
    };
  };

  const processForecastData = (forecastData) => {
    if (!forecastData || !forecastData.list) return [];
    
    // Group forecast data by date and get one entry per day (around noon)
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      const hour = date.getHours();
      
      // Prefer forecasts around noon (12:00) for daily representation
      if (!dailyForecasts[dateStr] || Math.abs(hour - 12) < Math.abs(new Date(dailyForecasts[dateStr].dt * 1000).getHours() - 12)) {
        dailyForecasts[dateStr] = item;
      }
    });
    
    // Convert to array and take first 5 days
    return Object.values(dailyForecasts).slice(0, 5);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatShortDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const unitSymbols = getUnitSymbols();
  const dailyForecasts = forecast ? processForecastData(forecast) : [];
  const config = context?.extension?.gadgetConfiguration;

  if (isLoading) {
    return (
      <Box xcss={mainContainerStyle}>
        <Heading as="h2">🌤️ Loading Weather Data...</Heading>
        <Text>Please wait while we fetch the latest weather information.</Text>
      </Box>
    );
  }

  return (
    <Box xcss={mainContainerStyle}>
      {/* Header with City Name and Weather Icon */}
      <Box xcss={headerStyle}>
        <Inline alignBlock="center" justifyContent="space-between">
          <Heading as="h1">🏙️ {weather ? weather.name : 'Unknown Location'} Weather</Heading>
          {weather && (
            <Image 
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
              alt={weather.weather[0].description}
            />
          )}
        </Inline>
      </Box>

      {/* Configuration Info Bar */}
      {config && (
        <Box xcss={configInfoStyle}>
          <Inline space="space.300" alignBlock="center">
            <Text><Strong>📍 City:</Strong> {config.name || 'N/A'}</Text>
            <Text><Strong>🌍 Country:</Strong> {config.country || 'N/A'}</Text>
            <Text><Strong>📏 Units:</Strong> {config.units === 'metric' ? 'Celsius' : 'Fahrenheit'}</Text>
          </Inline>
        </Box>
      )}

      {/* Current Weather Section */}
      <Box xcss={currentWeatherCardStyle}>
        <Heading as="h2" style={{ marginBottom: '12px' }}>🌡️ Current Conditions</Heading>
        <Inline space="space.400" alignBlock="center">
          <Text><Strong>🌤️ Current Temperature:</Strong> {weather ? weather.main.temp : '[ ]'}{unitSymbols.temp}</Text>
          <Text><Strong>🤒 Feels Like:</Strong> {weather ? weather.main.feels_like : '[ ]'}{unitSymbols.temp}</Text>
          <Text><Strong>💧 Humidity:</Strong> {weather ? weather.main.humidity : '[ ]'}%</Text>
          {weather && weather.wind && (
            <Text><Strong>🌬️ Wind:</Strong> {weather.wind.speed} {unitSymbols.speed}</Text>
          )}
        </Inline>
        <Box style={{ marginTop: '8px' }}>
          <Text><Strong>☁️ Conditions:</Strong> {weather ? weather.weather[0].description : 'Loading...'}</Text>
        </Box>
      </Box>

      {/* 5-Day Forecast Section - Horizontal Layout */}
      <Box xcss={forecastContainerStyle}>
        <Heading as="h2" style={{ marginBottom: '16px' }}>📅 5-Day Forecast</Heading>
        {dailyForecasts.length > 0 ? (
          <Inline space="space.100" alignBlock="start">
            {dailyForecasts.map((day, index) => (
              <Box key={index} xcss={forecastCardStyle}>
                <Stack space="space.100" alignInline="center">
                  <Text><Strong>{formatShortDate(day.dt)}</Strong></Text>
                  <Image 
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt={day.weather[0].description}
                    style={{ width: '40px', height: '40px' }}
                  />
                  <Text><Strong>{Math.round(day.main.temp_max)}/{Math.round(day.main.temp_min)}{unitSymbols.temp}</Strong></Text>
                  <Text style={{ fontSize: '12px' }}>{day.weather[0].main}</Text>
                </Stack>
              </Box>
            ))}
          </Inline>
        ) : (
          <Text>Forecast data is not available at the moment.</Text>
        )}
      </Box>
    </Box>
  );
};

const App = () => {
  const context = useProductContext();
  if (!context) {
    return "This is never displayed...";
  }

  return context.extension.entryPoint === "edit" ? <Edit /> : <View />;
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);