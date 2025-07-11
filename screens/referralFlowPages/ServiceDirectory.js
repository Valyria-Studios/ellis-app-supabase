import React, { useState, useEffect } from "react";
import { BlurView } from "expo-blur";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  Alert,
} from "react-native";

import globalstyles from "../../shared/globalStyles";
import renderIcon from "../../shared/RenderIconFunction";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import SearchComponent from "../../shared/SearchHeader";
import { authSupabase } from "../../api/supabaseClient";

const ServiceDirectory = ({ route, navigation }) => {
  const client = route.params?.client;
  const [frequentServices, setFrequentServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [nonProfits, setNonProfits] = useState([]); // Store NonProfits data
  const [loading, setLoading] = useState(true); // Track loading state
  const isFocused = useIsFocused();
  const [searchInput, setSearchInput] = useState(""); // State for search input

  const CACHE_EXPIRATION = 1000 * 60 * 60; // 1 hour
  const CACHE_KEY_SERVICES = "cache_services";
  const CACHE_KEY_NONPROFITS = "cache_nonprofits"; // Add cache key for NonProfits

  const handlePressOutside = () => {
    Keyboard.dismiss();
    setSearchInput(""); // Clears search input and hides search results
  };

  const fetchWithCache = async (cacheKey, url) => {
    try {
      const cachedItem = await AsyncStorage.getItem(cacheKey);
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_EXPIRATION) {
          return data;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      await AsyncStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: Date.now() })
      );
      return data;
    } catch (error) {
      console.error("Error fetching data with cache:", error);
      throw error;
    }
  };

  const loadFrequentServices = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);

      let freqs = stores
        .map(([key, value]) => {
          // Filter out cache keys and improperly formatted keys
          if (key.startsWith("cache_")) return null;

          const [
            categoryName,
            optionName,
            categoryIcon,
            categoryLibrary,
            serviceId,
          ] = key.split(":"); // Add serviceId to the key parsing

          // Skip keys with missing or undefined values
          if (
            !categoryName ||
            !optionName ||
            categoryName === "undefined" ||
            optionName === "undefined"
          )
            return null;

          return {
            option: optionName,
            categoryName: categoryName,
            icon: categoryIcon || "star", // Provide a default icon if missing
            categoryLibrary: categoryLibrary || Ionicons, // Provide a default library if missing
            count: JSON.parse(value),
            serviceId: serviceId || null, // Include serviceId to differentiate main and sub-services
          };
        })
        .filter(Boolean); // Remove null values

      freqs.sort((a, b) => b.count - a.count);
      setFrequentServices(freqs.slice(0, 5));
    } catch (error) {
      console.error("Failed to load frequencies", error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadFrequentServices();
    }
  }, [isFocused]);

  // Inside your ServiceDirectory component
  useEffect(() => {
    const loadServiceAndNonProfitsData = async () => {
      try {
        setLoading(true);

        // Fetch services (you can keep this or replace similarly if also stored in Supabase)
        const { data: servicesData, error: servicesError } = await authSupabase
          .from("services")
          .select("*");
        if (servicesError) throw servicesError;

        // 👇 Replace the NonProfits fetch with Supabase directly
        const { data: nonProfitsData, error } = await authSupabase
          .from("nonprofits")
          .select("*");

        if (error) {
          throw error;
        }

        // Transform services data (keep existing logic)
        const transformedCategories = servicesData.map((category) => ({
          id: category.id,
          name: category.name,
          Subservices: category.subservices.map((sub) => ({
            id: sub.id,
            name: sub.name,
            valueId: sub.id, // used for matching
          })),
        }));

        // Filter categories based on nonprofits from Supabase
        const filteredCategories = transformedCategories.filter((category) =>
          category.Subservices.some((sub) =>
            nonProfitsData.some((np) =>
              (np.services || []).some((svc) => svc.id === sub.id)
            )
          )
        );

        setServiceCategories(filteredCategories);
        setNonProfits(nonProfitsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadServiceAndNonProfitsData();
  }, []);

  const handleServicePress = (category) => {
    const filteredNonProfits = nonProfits.filter((np) =>
      (np.services || []).some((svc) =>
        category.Subservices.some((sub) => sub.id === svc.id)
      )
    );
    navigation.navigate("Service Details", {
      category,
      client,
      filteredNonProfits, // Pass filtered NonProfits to the next page
    });
  };

  if (loading) {
    return (
      <View
        style={[
          globalstyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      style={[
        globalstyles.container,
        { paddingHorizontal: 5, paddingLeft: 15 },
      ]}
    >
      {searchInput.trim() !== "" && (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
          <View style={styles.overlayContainer}>
            <BlurView intensity={20} tint="light" style={styles.overlay} />
          </View>
        </TouchableWithoutFeedback>
      )}
      <View style={{ zIndex: 10 }}>
        <SearchComponent
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          showProfileImage={true} // Hide the profile image here
        />
      </View>
      <ScrollView style={{ zIndex: 0 }} showsVerticalScrollIndicator={false}>
        <View>
          <View>
            <Text style={[styles.subHeader, { marginTop: 0 }]}>
              Recently Viewed
            </Text>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {frequentServices.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    navigation.navigate("Referral Location", {
                      option: item.option,
                      categoryName: item.categoryName,
                      client: client,
                      providedServicesId: item.serviceId, // Pass the stored serviceId for navigation
                    })
                  }
                  style={styles.frequentContainer}
                >
                  <View>
                    <Text style={styles.frequentHeader}>
                      {item.categoryName}
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 30,
                    }}
                  >
                    {renderIcon(
                      item.icon,
                      item.catergoryLibrary,
                      styles.frequentIcon,
                      26
                    )}
                    <Text
                      style={styles.frequentOption}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      numberOfLines={2}
                    >
                      {item.option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <Text style={styles.subHeader}>Services</Text>
          {serviceCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => handleServicePress(category)}
            >
              <View key={index} style={styles.container}>
                <View
                  style={[
                    globalstyles.optionsContainer,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View style={{ flexDirection: "row" }}>
                    {renderIcon(
                      category.icon,
                      category.library,
                      styles.icon,
                      20
                    )}
                    <Text style={globalstyles.optionsText}>
                      {category.name}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="keyboard-arrow-right"
                    size={28}
                    style={{ color: "#094852" }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ marginVertical: 20 }}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    zIndex: 10, // Ensures it's above other elements
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Makes the overlay fill the screen
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Semi-transparent background
  },
  subHeader: {
    fontSize: 24,
    fontFamily: "gabarito-bold",
    marginTop: 10,
    color: "#094851",
  },
  container: {
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 15,
    backgroundColor: "#fff",
    borderColor: "#B5BABB",
  },
  icon: {
    color: "#094852",
    paddingLeft: 10,
  },
  frequentHeader: {
    fontFamily: "gabarito-regular",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#465355",
    textAlign: "left",
  },
  frequentIcon: {
    color: "#094852",
  },
  frequentContainer: {
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
    margin: 5,
    padding: 10,
    borderWidth: 1,
    borderRadius: 15,
    width: 125,
    height: 175,
    backgroundColor: "#FFFFFF",
    borderColor: "#B5BABB",
  },
  frequentOption: {
    color: "#171B1C",
    fontSize: 18,
    flexWrap: "wrap",
    flexShrink: 1,
    textAlign: "center",
    fontFamily: "gabarito-semibold",
  },
  orgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editButtonText: {
    color: "#10798B",
    fontFamily: "gabarito-bold",
    fontSize: 16,
  },
  orgText: {
    marginBottom: 6,
    fontFamily: "gabarito-regular",
    color: "#333",
  },
  orgLabel: {
    fontFamily: "gabarito-bold",
    color: "#094851",
  },
});

export default ServiceDirectory;
