import React from 'react';
import './App.css';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
// import Alert from 'react-bootstrap/Alert';   //removed in favor of httpdogs
import Weather from './Weather';
import Header from './Header';
import Footer from './Footer';
import Movies from './Movies';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      city: '',
      locationObj: {},
      showError: false,
      errorMessage: '',
      weatherArr: [],
      locationMap: '',
      lattitude: '',
      longitude: '',
      moviesArr: []
    };
  }

  handleChange = (event) => {
    let typedCity = event.target.value;
    this.setState({ city: typedCity });
    console.log(typedCity);
  };

  getLocation = async (event) => {
    event.preventDefault();
    const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.REACT_APP_LOCATIONIQ_KEY}&q=${this.state.city}&format=json`;
    console.log('URL: ', url);
    try {
      let response = await axios.get(url);
      console.log('Location response: ', response.data[0]);
      this.setState({
        locationObj: response.data[0],
        lattitude: response.data[0].lat,
        longitude: response.data[0].lon,
        locationMap: `https://maps.locationiq.com/v3/staticmap?key=${process.env.REACT_APP_LOCATIONIQ_KEY}&center=${response.data[0].lat},${response.data[0].lon}&zoom=12`
      }, this.getWeatherAndMovies);
      // When a city search successfully returns `lot` and `lon` info, immediately create a new request (lat/lon included) to your server's `/weather` endpoint.

      // this.getWeather(); //duplication
    } catch (error) {
      this.setState({
        showError: true,  // turning on the error display
        locationMap: `https://httpstatusdogs.com/img/${error.response.status}.jpg`,
        errorMessage: error.response.status + ': ' + error.response.data.error
      })
    }
  }

  getWeatherAndMovies = () => {
    this.getWeather();
    this.getMovies();
  }

  getWeather = async () => {
    const url = `${process.env.REACT_APP_SERVER}/weather?lat=${this.state.lattitude}&lon=${this.state.longitude}&searchQuery=${this.state.city}`
    // const url = `https://api.weatherbit.io/v2.0/alerts?lat=${this.state.locationObj.lat}&lon=${this.state.locationObj.lon}&key=${process.env.WEATHER_API_KEY}`;
    try {
      let response = await axios.get(url);
      console.log('Weather response: ', response.data);
      this.setState({
        weatherArr: response.data
      });
    } catch (error) {
      this.setState({
        showError: true,
        errorMessage: error.response.status + ': ' + error.response.data.error
      })
    }
  }

  getMovies = async () => {
    const url = `${process.env.REACT_APP_SERVER}/movies?searchQuery=${this.state.city}`;

    try {
      let response = await axios.get(url);
      console.log('Movies response: ', response.data);
      this.setState({
        moviesArr: response.data
      });

    } catch (error) {
      this.setState({
        showError: true,
        errorMessage: error.response.status + ': ' + error.response.data.error
      })
    }
  }


  render() {
    console.log("This.state in App.js: ", this.state);
    return (
      <div className="App">
        <Header />
        <Container id='body'>
          <Form className='form' onSubmit={this.getLocation}>
            Your City:{" "}
            <Form.Control type="text" name="yourcity" onChange={this.handleChange} />
            <Button id='exploreButton' type='submit'>Search </Button>
          </Form>
        </Container>
        {this.state.locationObj.display_name &&
          <Container className='container' id='body'>
            <p>You searched for:</p>
            <p>{this.state.locationObj.display_name}</p>
            <p>Lat/Lon: {this.state.locationObj.lat}, {this.state.locationObj.lon}</p>
            <Image className='map' rounded src={this.state.locationMap} alt={this.state.locationObj.display_name} />
            <Weather id='weather' weatherArr={this.state.weatherArr}>This is where the weather goes! Test: {this.state.weatherArr}</Weather>
            <Movies moviesArr={this.state.moviesArr} />
          </Container>
        }
        <Footer />
      </div>
    );
  }
}

export default App;
