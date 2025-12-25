require('dotenv').config();


const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const weathermapApiKey = process.env.WEATHERMAP_APIKEY;



async function getLocation(city){
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${weathermapApiKey}`;
    try{
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const firstResult = data[0]; 

        return [firstResult?.lat, firstResult?.lon]
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error
    }    
}

async function getWeatherInfo(lat, lon){
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weathermapApiKey}`
    try{
        const response = await fetch(url);
        if (!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const temperature = data.main.temp;
        const condition = data.weather[0]?.main;
        
        return [KelvinToCelsius(temperature), condition]
    } catch(error){
        console.error('Error fetching data:', error);
        throw error
    }
}

function KelvinToCelsius(num){
    return (num - 273.15).toFixed(1)
}

app.use('/static',express.static('public'))

app.get('/', (req, res)=>{
    res.send("server running")
})

app.get('/weather', async (req,res) =>{
    const city = req.query.city;
    if (!city){
        res.status(400).json({error: "invalid city"})
    }

    try{
        const [lat, lon] = await getLocation(city);
        const [temp, cond] = await getWeatherInfo(lat, lon);
        
        res.status(200).json({
            city: city, 
            temperature: temp, 
            condition: cond
        });
    } catch(error){
        res.status(500).json({ error: "Failed to fetch weather data" });
    }


})


app.listen(port, () => {
    console.log("server running on: ", port)
})