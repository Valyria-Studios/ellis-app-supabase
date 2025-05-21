// screens/onboarding/EnterInviteCodePage.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import globalstyles from "../../shared/globalStyles";
import { authSupabase } from "../../api/supabaseClient";
import { useUser } from "../../context/userContext"; // Add this

const EnterInviteCodePage = ({ navigation }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setOrgId } = useUser(); // Add this

  const handleSubmit = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      setError("Please enter a code");
      return;
    }

    setLoading(true);
    setError("");

    // Step 1: Fetch code that hasn't been used
    const { data, error } = await authSupabase
      .from("invite_codes")
      .select("id, organization_id, used")
      .eq("code", trimmedCode)
      .single();

    if (error || !data) {
      setError("Invalid invite code. Please try again.");
      setLoading(false);
      return;
    }

    if (data.used) {
      setError("This invite code has already been used.");
      setLoading(false);
      return;
    }

    // Step 2: Mark code as used
    const { error: updateError } = await authSupabase
      .from("invite_codes")
      .update({ used: true })
      .eq("id", data.id);

    if (updateError) {
      console.error("Failed to update invite code:", updateError.message);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setOrgId(data.organization_id); // ✅ Save to context
    navigation.push("InviteRegister");

    setLoading(false);
  };

  return (
    <SafeAreaView style={globalstyles.container}>
      <View style={styles.container}>
        <Text style={globalstyles.header}>Enter Invite Code</Text>
        <Text style={globalstyles.subHeader}>
          Ask your organization admin for a code
        </Text>
        <TextInput
          style={[globalstyles.textInput, styles.input]}
          placeholder="Enter invite code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[globalstyles.buttonContainer, styles.button]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={globalstyles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    marginVertical: 15,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: "#E63946",
    fontSize: 14,
    paddingLeft: 4,
    marginBottom: 8,
  },
});

export default EnterInviteCodePage;
