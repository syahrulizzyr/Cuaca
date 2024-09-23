import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from "lodash";
import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { theme } from '../theme';
import { weatherImages } from '../constants';
import { getData, storeData } from '../utils/asyncStorage';

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});

  const handleSearch = (search) => {
    if (search && search.length > 2) {
      fetchLocations({ cityName: search }).then(data => {
        setLocations(data);
      });
    }
  }

  const handleLocation = (loc) => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      setLoading(false);
      setWeather(data);
      storeData('city', loc.name);
    })
  }

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Islamabad';
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data => {
      setWeather(data);
      setLoading(false);
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current, forecast } = weather;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        style={{ ...StyleSheet.absoluteFillObject }}
      />
      {loading ? (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          {/* Search Section */}
          <View style={{ height: '7%', marginHorizontal: 10, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderRadius: 25, backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={'lightgray'}
                  style={{ paddingLeft: 16, height: 40, flex: 1, fontSize: 16, color: 'white' }}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{ backgroundColor: theme.bgWhite(0.3), borderRadius: 20, padding: 8, margin: 4 }}
              >
                {showSearch ? 
                <XMarkIcon size={25} color="white" /> : 
                <MagnifyingGlassIcon size={25} color="white" />
                }
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <ScrollView style={{ position: 'absolute', width: '100%', backgroundColor: 'gray', top: 50, borderRadius: 20 }}>
                {locations.map((loc, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleLocation(loc)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderBottomWidth: 2,
                      borderBottomColor: 'gray',
                      padding: 10,
                    }}
                  >
                    <MapPinIcon size={20} color="gray" />
                    <Text style={{ color: 'black', fontSize: 16, marginLeft: 5 }}>{loc?.name}, {loc?.country}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
          </View>

          {/* Forecast Section */}
          <View style={{ margin: 10, flex: 1, justifyContent: 'space-around' }}>
            {/* Location */}
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>
              {location?.name},
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>{location?.country}</Text>
            </Text>

            {/* Weather Icon */}
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Image
                source={weatherImages[current?.condition?.text || 'other']}
                style={{ width: 120, height: 120 }}
              />
            </View>

            {/* Degree Celsius */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 50, fontWeight: 'bold', marginLeft: 5 }}>{current?.temp_c}&#176;</Text>
              <Text style={{ color: 'white', fontSize: 20, letterSpacing: 1 }}>{current?.condition?.text}</Text>
            </View>

            {/* Other Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assets/icons/wind.png')} style={{ width: 20, height: 20 }} />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginLeft: 5 }}>{current?.wind_kph} km</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assets/icons/drop.png')} style={{ width: 20, height: 20 }} />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginLeft: 5 }}>{current?.humidity}%</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={require('../assets/icons/sun.png')} style={{ width: 20, height: 20 }} />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginLeft: 5 }}>
                  {forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>

            {/* Forecast for Next Days */}
            <View style={{ marginVertical: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
                <CalendarDaysIcon size={22} color="black" />
                <Text style={{ color: 'black', fontSize: 16, marginLeft: 5 }}>Daily forecast</Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {forecast?.forecastday?.map((item, index) => {
                  const date = new Date(item.date);
                  const options = { weekday: 'long' };
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];

                  return (
                    <View
                      key={index}
                      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: 120, borderRadius: 20, paddingVertical: 10, marginRight: 10, backgroundColor: theme.bgWhite(0.15) }}
                    >
                      <Image
                        source={weatherImages[item?.day?.condition?.text || 'other']}
                        style={{ width: 50, height: 50 }}
                      />
                      <Text style={{ color: 'black' }}>{dayName}</Text>
                      <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>{item?.day?.avgtemp_c}&#176;</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
