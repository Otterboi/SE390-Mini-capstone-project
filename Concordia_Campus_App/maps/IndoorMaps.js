import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';

const IndoorMaps = () => {
  // Available buildings and floors with images for the buildings
  const floorPlans = {
    "Henry F.Hall Building": {
      floors: {
        1: require('../assets/floor_plans/Hall-1.png'),
        2: require('../assets/floor_plans/Hall-2.png'),
        8: require('../assets/floor_plans/Hall-8.png'),
        9: require('../assets/floor_plans/Hall-9.png'),
      },
    },
    "John Molson School of Business": {
      floors: {
        S2: require('../assets/floor_plans/MB-S2.png'),
        1: require('../assets/floor_plans/MB-1.png'),
      },
    },
    "Vanier Library Building": {
      floors: {
        1: require('../assets/floor_plans/VL-1.png'),
        2: require('../assets/floor_plans/VL-2.png'),
      },
    },
    "Vanier Extension": {
      floors: {
        1: require('../assets/floor_plans/VE-1.png'),
        2: require('../assets/floor_plans/VE-2.png'),
      },
    },
    "Central Building": {
      floors: {
        1: require('../assets/floor_plans/CC1.png'),
      },
    },
  };

  // State to track selected building, floor, and search query
  const [selectedBuilding, setSelectedBuilding] = useState(Object.keys(floorPlans)[0]);
  const [selectedFloor, setSelectedFloor] = useState(Object.keys(floorPlans[Object.keys(floorPlans)[0]].floors)[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter buildings based on search query
  const filteredBuildings = Object.keys(floorPlans).filter((building) =>
    building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update available floors whenever the selected building changes
  useEffect(() => {
    setSelectedFloor(Object.keys(floorPlans[selectedBuilding].floors)[0]); // Reset to first floor of the new building
  }, [selectedBuilding]);

  // Get the floor plan image based on selection
  const floorPlan = floorPlans[selectedBuilding]?.floors[selectedFloor];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar_insidemap}
        placeholder="Search for a room"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Picker Dropdown */}
      <View style={styles.buildingButtonsContainer}>
        {filteredBuildings.map((building) => (
          <TouchableOpacity
            key={building}
            style={[
              styles.buildingButton,
              selectedBuilding === building && styles.selectedBuildingButton,
            ]}
            onPress={() => setSelectedBuilding(building)} // Set building on button press
          >
            <Text style={styles.buildingButtonText}>{building}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

      {/* Display Floor Plan */}
      <View style={styles.overlay}>
        {/* Floor Plan Image */}
        {floorPlan ? (
          <Image source={floorPlan} style={styles.image} />
        ) : (
          <Text style={styles.errorText}>Floor plan not available</Text>
        )}
      </View>

      {/* Floor Buttons Container */}
      <View style={styles.floorButtonsContainer}>
        {/* Rectangular Box for all Floor Buttons */}
        <View style={styles.floorButtonsBox}>
        {Object.keys(floorPlans[selectedBuilding].floors).map((floor) => (
        <TouchableOpacity
          key={floor}
          style={[
            styles.floorButton,
            selectedFloor === floor && styles.selectedButton, // Highlight selected button
          ]}
          onPress={() => setSelectedFloor(floor)} // Set floor on button press
        >
          <Text style={styles.floorButtonText}>{floor}</Text>
        </TouchableOpacity>
      ))}
      </View>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',  // Arrange search bar and picker horizontally
    alignItems: 'center',  // Vertically center them
    justifyContent: 'flex-start',  // Align items to the left
    width: '100%',
    marginBottom: 20,
    zIndex: 2,
  },
  searchBar_insidemap: {
    height: 40,
    width: '50%',  
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    left:-8,
    marginRight: 10,  
  },
  buildingButtonsContainer: {
    flexDirection: 'column',
    left:-10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  image: {
    width: 600,
    height: 600,
    marginBottom: 20,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  floorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  floorButtonsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  floorButton: {
    backgroundColor: '#800000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    margin: 5,
    width: 60,  // Adjust width for a cleaner layout
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#FF4D00', // Highlight selected floor button
  },
  floorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default IndoorMaps;
