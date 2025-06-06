import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import globalstyles from "../../shared/globalStyles";
import Card from "../../shared/Card";
import { MaterialIcons, Octicons, Feather } from "@expo/vector-icons";
import { authSupabase } from "../../api/supabaseClient";

const SelectReferralLocation = ({ route, navigation }) => {
  const { option, categoryName, client, providedServicesId } = route.params;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    const fetchFromSupabase = async () => {
      setLoading(true);
      const { data, error } = await authSupabase.from("nonprofits").select("*");

      if (error) {
        console.error("Supabase fetch error:", error);
        setLoading(false);
        return;
      }

      const filtered = data.filter((nonProfit) =>
        nonProfit.services?.some((service) =>
          providedServicesId.includes(service.id)
        )
      );

      setServices(filtered);
      setLoading(false);
    };

    fetchFromSupabase();
  }, [providedServicesId]);

  const handleOptionSelect = (service) => {
    if (client) {
      navigation.navigate("Enrollment Form", {
        selectedClient: client,
        selectedService: service,
        option: option,
      });
    } else {
      navigation.navigate("Select Client With Location", {
        option,
        selectedService: service,
      });
    }
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

  // Add this block
  if (services.length === 0) {
    return (
      <View
        style={[
          globalstyles.container,
          {
            paddingHorizontal: 5,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={[styles.caption, { fontSize: 20 }]}>
          No Available Nonprofits for this service
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[globalstyles.container, { paddingHorizontal: 5 }]}
    >
      <View>
        {client && (
          <Text style={styles.caption}>
            Recommended services based on {client.fullName} profile:
          </Text>
        )}
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={1}
            onPress={() =>
              setExpandedCard(expandedCard === index ? null : index)
            }
          >
            <Card>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
                <MaterialIcons
                  name={
                    expandedCard === index ? "remove" : "keyboard-arrow-down"
                  }
                  size={24}
                  color={"#094852"}
                />
              </View>
              <View>
                <Text style={styles.title}>
                  {service.name || "Name not available"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 5,
                    alignItems: "center",
                  }}
                >
                  <Octicons name="location" size={18} color={"#094852"} />
                  <Text style={styles.amenityText}>
                    {service.attributes?.["Address"]?.trim() ||
                      service.attributes?.["Street address"]?.trim() ||
                      "Street address not available"}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 5,
                    alignItems: "center",
                  }}
                >
                  <Feather name="clock" size={16} color={"#094852"} />
                  <Text style={styles.amenityText}>
                    {service.attributes?.["Working hours"] ||
                      "Operational hours not available"}
                  </Text>
                </View>
              </View>
              {expandedCard === index && (
                <View style={{ marginVertical: 10 }}>
                  <View style={styles.typeContainer}>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        flex: 1,
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      {Array.isArray(service.attributes?.Tags) ? (
                        service.attributes.Tags.map((tag, tagIndex) => (
                          <TouchableOpacity
                            key={tagIndex}
                            style={styles.typeBox}
                            onPress={() => {
                              navigation.navigate("Nonprofit Tags", {
                                selectedTag: tag.trim(),
                              });
                            }}
                          >
                            <Text style={styles.typeText}>{tag.trim()}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <TouchableOpacity
                          style={styles.typeBox}
                          onPress={() => {
                            if (service.attributes?.Tags) {
                              navigation.navigate("Nonprofit Tags", {
                                selectedTag: service.attributes.Tags.trim(),
                              });
                            }
                          }}
                        >
                          <Text style={styles.typeText}>
                            {service.attributes?.Tags || "Tags not available"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Amenity Page", {
                          amenity: service,
                        })
                      }
                    >
                      <Feather
                        name="arrow-up-right"
                        size={26}
                        color={"#094852"}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.descriptionText}>
                    {Array.isArray(service.attributes?.Description) &&
                    service.attributes?.Description.length === 0
                      ? "Description not available"
                      : service.attributes?.Description}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <View
                  style={[
                    styles.enrollmentContainer,
                    service.attributes?.Availability === "0"
                      ? styles.waitlistContainer
                      : styles.enrollmentContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.cardAvailabilityText,
                      service.attributes?.Availability === "0"
                        ? styles.waitlistText
                        : styles.enrollmentText,
                    ]}
                  >
                    {service.attributes?.Availability === "0"
                      ? "Waitlist"
                      : "Enrollment Available"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ padding: 10 }}
                  onPress={() => handleOptionSelect(service)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons
                      name="app-registration"
                      size={16}
                      color={"#094852"}
                      style={{ paddingRight: 5 }}
                    />
                    <Text style={styles.referText}>Refer</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  caption: {
    fontFamily: "karla-regular",
    fontSize: 16,
    color: "#094852",
    marginHorizontal: 5,
    marginVertical: 10,
    letterSpacing: -0.7,
  },
  optionText: {
    fontFamily: "gabarito-regular",
    fontSize: 12,
    color: "#465355",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "gabarito-semibold",
    fontSize: 24,
    color: "#094852",
  },
  amenityText: {
    fontFamily: "gabarito-regular",
    color: "#094852",
    fontSize: 18,
    paddingLeft: 10,
  },
  descriptionText: {
    fontFamily: "karla-regular",
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  typeBox: {
    borderWidth: 1,
    borderColor: "#c9cbcd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
    backgroundColor: "#ffffff",
  },
  typeText: {
    color: "#114e57",
    fontSize: 16,
    fontFamily: "karla-regular",
    textTransform: "capitalize",
  },
  enrollmentContainer: {
    backgroundColor: "#E7F2F3",
    borderWidth: 1,
    borderColor: "#4094A2",
    padding: 8,
    borderRadius: 15,
  },
  waitlistContainer: {
    backgroundColor: "#FBEFDD",
    borderWidth: 1,
    borderColor: "#ECAD53",
    padding: 8,
    borderRadius: 15,
  },
  enrollmentText: {
    fontFamily: "karla-regular",
    fontSize: 14,
    color: "#094852",
  },
  waitlistText: {
    fontFamily: "karla-regular",
    fontSize: 14,
    color: "#533409",
  },
  referText: {
    fontFamily: "gabarito-regular",
    fontSize: 16,
    color: "#094852",
    alignItems: "center",
  },
});

export default SelectReferralLocation;
