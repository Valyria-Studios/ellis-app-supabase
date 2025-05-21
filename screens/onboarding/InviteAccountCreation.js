import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { authSupabase } from "../../api/supabaseClient";
import { useUser } from "../../context/userContext";
import globalstyles from "../../shared/globalStyles";

const InviteAccountCreation = () => {
  const navigation = useNavigation();
  const { orgId, setWasInvited } = useUser();
  const { user, fetchUserProfile } = useUser();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [orgName, setOrgName] = useState(null);

  useEffect(() => {
    const fetchOrgName = async () => {
      if (!orgId) return;

      const { data, error } = await authSupabase
        .from("nonprofits")
        .select("name")
        .eq("id", orgId)
        .single();

      if (error) {
        console.error("Failed to fetch organization name:", error.message);
      } else {
        setOrgName(data.name);
      }
    };

    fetchOrgName();
  }, [orgId]);

  const validateForm = () => {
    if (!name.trim()) {
      setNameError("Please enter your full name");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleAccountCreation = async () => {
    if (!validateForm()) return;

    if (!user || !user.id) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authSupabase.from("users").upsert([
        {
          user_id: user.id,
          email: user.email,
          name,
          organization: orgId,
          clients: [],
          servicedetails: [],
        },
      ]);

      if (error) throw error;

      await fetchUserProfile(user.id);

      await authSupabase.auth.updateUser({
        data: { wasInvited: false },
      });
      setWasInvited(false);
      Alert.alert("Success", "You're all set!");
      // Optionally navigate to main app
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={globalstyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/ellis-test-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>Set Up Your Profile</Text>
          <Text style={styles.subHeader}>
            {orgName
              ? `You've been invited to join ${orgName} — just enter your name to continue.`
              : `You've been invited to join an organization — just enter your name to continue.`}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              placeholder="Enter your name"
              style={[
                styles.textInput,
                focusedInput === "name" && styles.focusedInput,
              ]}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleAccountCreation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  logoContainer: { alignItems: "center", marginTop: 40, marginBottom: 30 },
  logo: { width: 120, height: 120, borderRadius: 25 },
  headerContainer: { marginBottom: 30, paddingHorizontal: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subHeader: { fontSize: 16, color: "#555", lineHeight: 22 },
  formContainer: { marginTop: 10, paddingHorizontal: 20 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDE5E7",
    fontSize: 16,
  },
  focusedInput: {
    borderColor: "#10798B",
    borderWidth: 1.5,
    shadowColor: "#10798B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    backgroundColor: "#10798B",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#D9E2E5",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#E63946",
    fontSize: 13,
    marginTop: 4,
  },
});

export default InviteAccountCreation;
