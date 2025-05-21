import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalstyles from "../../shared/globalStyles";
import { useUser } from "../../context/userContext";
import { authSupabase } from "../../api/supabaseClient";
import { v4 as uuidv4 } from "uuid"; // Make sure this is installed

const UserProfile = () => {
  const route = useRoute();
  const { profile, organization } = route.params;
  const { updateOrganization } = useUser();
  const [inviteCode, setInviteCode] = useState("");

  const generateSimpleCode = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateInviteCode = async () => {
    const code = generateSimpleCode(); // returns 8-char random code
    setInviteCode(code);
    console.log(code);

    // Check if code already exists (optional safety check)
    const { data: existing, error: checkError } = await authSupabase
      .from("invite_codes")
      .select("code")
      .eq("code", code)
      .maybeSingle();

    if (existing) {
      Alert.alert("Duplicate Code", "Try again to generate a new code.");
      return;
    }

    const { error } = await authSupabase.from("invite_codes").insert([
      {
        code,
        organization_id: organization.id, // should be UUID
        created_by: profile.email,
        used: false,
      },
    ]);

    if (error) {
      console.error("Error generating invite code:", error.message);
      Alert.alert("Error", "Failed to generate invite code.");
    } else {
      Alert.alert("Invite Code Created", `Code: ${code}`);
    }
  };

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

      <TouchableOpacity
        style={[globalstyles.buttonContainer, { marginTop: 20 }]}
        onPress={generateInviteCode}
      >
        <Text style={globalstyles.buttonText}>Generate Invite Code</Text>
      </TouchableOpacity>

      {inviteCode ? (
        <Text style={{ marginTop: 10, fontSize: 16 }}>
          Invite Code: <Text style={{ fontWeight: "bold" }}>{inviteCode}</Text>
        </Text>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  label: { fontSize: 18, fontWeight: "600", marginTop: 10, color: "#444" },
  info: { fontSize: 16, marginTop: 2, color: "#666" },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
  },
});

export default UserProfile;
