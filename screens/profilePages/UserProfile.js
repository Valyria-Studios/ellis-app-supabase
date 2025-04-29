import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import globalstyles from "../../shared/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../../context/userContext";

const UserProfile = () => {
  const route = useRoute();
  const { profile, organization } = route.params;
  const { updateOrganization } = useUser();

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user information available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[globalstyles.container, { marginTop: -50 }]}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.info}>{profile.name || "N/A"}</Text>

      <Text style={styles.label}>Organization:</Text>
      <Text style={styles.info}>{organization.name || "N/A"}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.info}>{profile.email || "N/A"}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#094852",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    color: "#444",
  },
  info: {
    fontSize: 16,
    marginTop: 2,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});

export default UserProfile;
