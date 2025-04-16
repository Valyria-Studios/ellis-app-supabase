import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { authSupabase } from "../../api/supabaseClient";
import { useUser } from "../../context/userContext";
import globalstyles from "../../shared/globalStyles";

const AccountCreation = ({ navigation }) => {
  const { user, fetchUserProfile } = useUser();

  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [orgError, setOrgError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  // dropdown state
  const [orgList, setOrgList] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNonprofits = async () => {
      const { data, error } = await authSupabase
        .from("nonprofits")
        .select("id, name");

      if (error) {
        console.error("Failed to fetch nonprofits:", error);
        return;
      }

      const formatted = data.map((np) => ({
        label: np.name,
        value: np.id,
      }));

      setOrgList(formatted);
    };

    fetchNonprofits();
  }, []);

  const validateForm = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Please enter your full name");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!organization) {
      setOrgError("Please select your organization");
      isValid = false;
    } else {
      setOrgError("");
    }

    return isValid;
  };

  const handleAccountCreation = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!user || !user.id) {
        Alert.alert("Error", "User not authenticated.");
        setLoading(false);
        return;
      }

      const { error } = await authSupabase.from("users").upsert([
        {
          user_id: user.id,
          email: user.email,
          name,
          organization,
          clients: [],
          servicedetails: [],
        },
      ]);

      if (error) throw error;

      await fetchUserProfile(user.id);
      Alert.alert(
        "Success",
        "Account setup complete! You'll now be directed to the service directory.",
        [
          {
            text: "Great!",
          },
        ]
      );
    } catch (error) {
      console.error("Account Creation Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={globalstyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/ellis-test-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>Complete Your Profile</Text>
          <Text style={styles.subHeader}>
            We need just a few more details before you can start using Ellis
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
              onChangeText={(text) => {
                setName(text);
                if (text) setNameError("");
              }}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Organization</Text>
            <DropDownPicker
              open={open}
              value={organization}
              items={orgList}
              setOpen={setOpen}
              setValue={(val) => {
                setOrganization(val);
                if (val) setOrgError("");
              }}
              setItems={setOrgList}
              searchable={true}
              searchPlaceholder="Search for your organization..."
              placeholder="Select your organization"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              searchTextInputStyle={styles.searchInput}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              zIndex={3000}
              zIndexInverse={1000}
            />
            {orgError ? <Text style={styles.errorText}>{orgError}</Text> : null}
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

          <TouchableOpacity style={styles.helpLink}>
            <Text style={styles.helpText}>
              Don't see your organization?{" "}
              <Text style={styles.helpHighlight}>Contact support</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 25,
  },
  headerContainer: {
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },
  formContainer: {
    marginTop: 10,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
    paddingLeft: 4,
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
  dropdown: {
    backgroundColor: "#ffffff",
    borderColor: "#DDE5E7",
    borderRadius: 8,
    height: 50,
    marginBottom: 5,
  },
  dropdownContainer: {
    borderColor: "#DDE5E7",
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownPlaceholder: {
    color: "#999",
    fontSize: 16,
  },
  searchInput: {
    borderColor: "#DDE5E7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
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
    paddingLeft: 4,
  },
  helpLink: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
  },
  helpText: {
    color: "#666",
    fontSize: 15,
    textAlign: "center",
  },
  helpHighlight: {
    color: "#10798B",
    fontWeight: "600",
  },
});

export default AccountCreation;
