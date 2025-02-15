import React, { useState, useRef, useEffect } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import styles from './styles/mapScreenStyles'; 
import buildingsData from './buildingCoordinates.js';
import BuildingPopup from './BuildingPopup'; 
import { API_KEY } from '@env';
import ShuttleBusMarker from './ShuttleBusMarker';
import { getLocation } from './locationUtils';
import MapDirections from './MapDirections';

const MapScreen = ({route}) => {
  const [campus, setCampus] = useState('SGW');
  const [zoomLevel, setZoomLevel] = useState(0.005); 
  const [selectedBuilding, setSelectedBuilding] = useState(null); 
  const mapRef = useRef(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [shuttleStop, setShuttleStop] = useState(null);
  const [toggleMapDirections, setToggleMapDirections] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const {destinationLoc} = route.params || {};
  const {destinationCoords} = route.params || {};


  const campusLocations = {
    SGW: {
      latitude: 45.49532997441208,
      longitude: -73.57859533082366,
      title: 'SGW Campus',
      description: 'A well-known university located in Montreal, Canada',
    },
    Loyola: {
      latitude: 45.458161998720556,
      longitude: -73.63905090035233,
      title: 'Loyola Campus',
      description: 'Loyola Campus of Concordia University',
    },
  };

  const location = campusLocations[campus];


  useEffect(() => {
    let interval;
      const fetchUserLocation = async () => {
        const location = await getLocation();
        if(location){
          setUserLocation(location);
        }
      };
      if(toggleMapDirections && shuttleStop){
        fetchUserLocation();
        interval = setInterval(fetchUserLocation, 5000);
      }
      return () => {
        if(interval) clearInterval(interval);
      };
    }, [toggleMapDirections,shuttleStop]);
  

  async function moveToLocation(latitude, longitude) {
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      },
      2000 //amount of time it takes to animate
    )
  }

  const handleZoomIn = () => {
    // Zoom in by decreasing the delta more significantly
    setZoomLevel((prevZoom) => Math.max(prevZoom * 0.7, 0.0005)); // Zoom in more per click
  };

  const handleZoomOut = () => {
    // Zoom out by increasing the delta more significantly
    setZoomLevel((prevZoom) => Math.min(prevZoom / 0.7, 0.05)); // Zoom out more per click
  };


  const handlePolygonPress = (building) => {
    setSelectedBuilding(building); // Update the selected building info
    setSelectedMarker({
      latitude: building.markerCoord.latitude,
      longitude: building.markerCoord.longitude
    });
  };

  const handleClosePopup = () => {
    setSelectedBuilding(null); // Close the popup by clearing the selected building
  };

  useEffect(() => {
    if (destinationLoc) {
      console.log('Destination Location:', destinationLoc);
      
      const selectedBuilding = buildingsData.buildings.find(
        (building) => building.name === destinationLoc
      );
  
      if (selectedBuilding) {
        handlePolygonPress(selectedBuilding); // Highlight the building
        moveToLocation(selectedBuilding.markerCoord.latitude, selectedBuilding.markerCoord.longitude);
      }
    }
  }, [destinationLoc]);
  
  useEffect(() => {
    if (destinationCoords) {
      console.log('Processing directions for:', destinationCoords);
  
      // Check if it's a known building
      const selectedBuilding = buildingsData.buildings.find(
        (building) => building.name === destinationCoords
      );
  
      if (selectedBuilding) {
        setShuttleStop({
          latitude: selectedBuilding.markerCoord.latitude,
          longitude: selectedBuilding.markerCoord.longitude,
        });
        setToggleMapDirections(true);
        moveToLocation(selectedBuilding.markerCoord.latitude, selectedBuilding.markerCoord.longitude);
      } 
      else if (destinationCoords.latitude && destinationCoords.longitude) {
        // Handle raw latitude/longitude destinations
        setShuttleStop(destinationCoords);
        setToggleMapDirections(true);
      } 
      else {
        console.error("Invalid destinationCoords format:", destinationCoords);
      }
    }
  }, [destinationCoords]);
  
  

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <GooglePlacesAutocomplete
          fetchDetails={true}
          placeholder="Search Building or Class..."
          styles={{
            textInput: styles.searchBar, 
          }}
          query={{
            key: API_KEY,
            language: 'en',
          }}
          onPress={(data, details = null) => {
            console.log(JSON.stringify(details?.geometry?.location));
            moveToLocation(details?.geometry?.location.lat, details?.geometry?.location.lng);
            setSelectedMarker({
              latitude: details?.geometry?.location.lat,
              longitude: details?.geometry?.location.lng,
            });
              console.log('Selected Marker:', selectedMarker); // Debug marker state
          }}
          onFail={(error) => console.log('Error:', error)}
        />
      </View>

      <View style={styles.toggleButtonContainer}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setCampus(campus === 'SGW' ? 'Loyola' : 'SGW')}
        >
          <Text style={styles.toggleButtonText}>
            <Text style={campus === 'SGW' ? styles.highlightedText : styles.normalText}>SGW</Text>
            {' | '}
            <Text style={campus === 'Loyola' ? styles.highlightedText : styles.normalText}>LOY</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <MapView
        ref = {mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: zoomLevel, // Use zoomLevel for zooming
          longitudeDelta: zoomLevel,
        }}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: zoomLevel,
          longitudeDelta: zoomLevel,
        }}
      >
              
        <ShuttleBusMarker setToggleMapDirections={setToggleMapDirections} setShuttleStop={setShuttleStop}/>
          
        {toggleMapDirections && userLocation && shuttleStop && (
          <MapDirections 
            userLocation={userLocation} 
            destinationLocation={shuttleStop}/>
        )}
         
        {selectedMarker && (
          <Marker
            coordinate={{
              latitude: selectedMarker.latitude,
              longitude: selectedMarker.longitude,
            }}
            pinColor="blue"
            title="Selected Location"
            style={{
              zIndex: 1000,
            }}
          />
        )}

        {buildingsData.buildings.map((building, index) => (
          <Polygon
            key={index}
            coordinates={building.coordinates}
            fillColor={building.fillColor}
            strokeColor={building.strokeColor}
            strokeWidth={2}
            onPress={() => handlePolygonPress(building)} // Handle the polygon press
          />
        ))}

      </MapView>
      {/* Render the BuildingPopup component with the close handler */}
      <BuildingPopup building={selectedBuilding} onClose={handleClosePopup} />

      {/* Zoom in/out buttons */}
      <View style={styles.zoomButtonContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapScreen;
