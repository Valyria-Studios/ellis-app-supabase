import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Fontisto from "@expo/vector-icons/Fontisto";
import Icon from "@expo/vector-icons/Ionicons";
import Card from "../shared/Card";
import Clients from "../api/Clients";
import globalstyles from "../shared/globalStyles";

const RelationshipPage = () => {
  const [filter, setFilter] = useState("current"); // default filter
  const [searchInput, setSearchInput] = useState("");
  const [filteredClients, setFilteredClients] = useState(Clients);

  const handleSearchChange = (text) => {
    setSearchInput(text);
    const filtered = Clients.filter((client) =>
      client.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={globalstyles.searchSection}>
          <View style={globalstyles.searchContainer}>
            <Icon
              name="search-outline"
              size={25}
              color="#616a6c"
              style={globalstyles.searchIcon}
            />
            <TextInput
              value={searchInput}
              onChangeText={handleSearchChange}
              placeholder="Type in keyword"
              style={globalstyles.searchBar}
            />
          </View>
          <Fontisto
            name="nav-icon-grid-a"
            size={20}
            color="#094851"
            style={globalstyles.gridIcon}
          />
        </View>

        {/* Favorite People Section */}
        <View style={styles.relationshipsContainer}>
          <Text style={styles.relationships}>Relationships</Text>
        </View>
        <View style={styles.favoriteContainer}>
          <Text style={styles.headerText}>Favorites</Text>
          <ScrollView horizontal={true}>
            <Image
              source={require("../assets/images/userImage1.jpg")}
              style={styles.favoriteIcons}
            />
            <Image
              source={require("../assets/images/userImage2.jpg")}
              style={styles.favoriteIcons}
            />
            {/* ... add more profiles as needed */}
          </ScrollView>
        </View>

        {/* Filter Section */}
        <View>
          <Text style={styles.headerText}>All Relationships</Text>
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilter("current")}
          >
            <Text>Current</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilter("requested")}
          >
            <Text>Requested</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilter("past")}
          >
            <Text>Past</Text>
          </TouchableOpacity>
        </View>
        {filteredClients.map((client) => (
          <Card key={client.key}>
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <View style={styles.start}>
                  <Image source={client.image} style={styles.profileImage} />
                  <View>
                    <Text style={styles.name}>{client.name}</Text>
                    <Text style={styles.recency}>
                      {client.status === "Requested"
                        ? `Requested service ${client.recency}`
                        : `Last met: ${client.recency}`}
                    </Text>
                  </View>
                </View>
                <View>
                  <View
                    style={[
                      styles.status,
                      client.status === "Current"
                        ? {
                            backgroundColor: "#e7f2f3",
                            borderColor: "#5fa5b1",
                          }
                        : {},
                      client.status === "Requested"
                        ? {
                            backgroundColor: "#fdf8ee",
                            borderColor: "#f3c98b",
                          }
                        : {},
                      client.status === "Past"
                        ? {
                            backgroundColor: "#dbdddd",
                            borderColor: "#c7cccc",
                          }
                        : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        client.status === "Current" ? { color: "#41737a" } : {},
                        client.status === "Requested"
                          ? { color: "#694e27" }
                          : {},
                        client.status === "Past" ? { color: "#6c7576" } : {},
                      ]}
                    >
                      {client.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={
                client.status === "Requested"
                  ? styles.requestedContainer
                  : styles.providerContainer
              }
            >
              <Text
                style={
                  client.status === "Requested"
                    ? styles.requestedText
                    : styles.providersText
                }
              >
                {client.status === "Requested"
                  ? `REQUESTED SERVICES`
                  : `${client.providers}`}
              </Text>
            </View>
            <View style={styles.typeContainer}>
              {client.services && Array.isArray(client.services)
                ? client.services.map((services, index) => (
                    <View key={index} style={styles.typeBackground}>
                      <Text style={styles.individualType}>{services}</Text>
                    </View>
                  ))
                : null}
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f8f9",
    padding: 15,
    paddingBottom: 0,
  },

  relationshipsContainer: {
    marginVertical: 15,
  },

  relationships: {
    fontSize: 40,
    color: "#094851",
    fontFamily: "gabarito-bold",
  },

  favoriteContainer: {
    marginBottom: 20,
  },

  headerText: {
    fontSize: 20,
    color: "#727c7d",
    marginBottom: 10,
    fontFamily: "gabarito-regular",
  },

  favoriteIcons: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginLeft: 10,
  },

  filterContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },

  filterButton: {
    borderColor: "#1e8191",
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    alignItems: "center",
  },

  headerContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },

  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  start: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 15,
  },

  name: {
    color: "#053e59",
    fontSize: 24,
    fontFamily: "gabarito-semibold",
  },

  recency: {
    color: "#636c6e",
    fontSize: 16,
    fontFamily: "karla-regular",
  },

  status: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 18,
  },

  statusText: {
    padding: 8,
    fontSize: 12,
  },

  requestedContainer: {
    marginBottom: 0,
  },

  providerContainer: {
    marginBottom: 10,
  },

  requestedText: {
    fontSize: 16,
    color: "#677072",
    fontFamily: "gabarito-regular",
  },

  providersText: {
    fontSize: 16,
    color: "#677072",
    fontFamily: "karla-regular",
  },

  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // in case there are many types and they need to wrap to the next line
    marginTop: 10,
  },

  typeBackground: {
    borderWidth: 1,
    borderColor: "#c9cbcd",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5, // spacing between types
    marginBottom: 5,
  },

  individualType: {
    color: "#114e57",
    fontSize: 12,
  },
});

export default RelationshipPage;
