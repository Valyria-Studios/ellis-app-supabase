import React, { useState } from "react";
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
import { authSupabase } from "../../api/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import globalstyles from "../../shared/globalStyles";
import { useUser } from "../../context/userContext";

const InviteRegister = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [waitingForOtp, setWaitingForOtp] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleSubmit = async () => {
    setLoading(true);

    if (!email || !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    setEmailError("");

    try {
      const { error } = await authSupabase.auth.signInWithOtp({ email });

      if (error) {
        Alert.alert("Signup Error", error.message);
      } else {
        setWaitingForOtp(true);
        Alert.alert(
          "Check Your Email",
          "Enter the OTP code sent to your email."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Missing OTP", "Please enter the verification code");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authSupabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      const { data: sessionData, error: sessionError } =
        await authSupabase.auth.getSession();
      console.log("SESSION?", sessionData?.session?.user); // should log user object

      if (error) {
        Alert.alert("Verification Error", error.message);
        setLoading(false);
        return;
      }

      Alert.alert("Success", "You are registered!");

      // No need to manually update here anymore
      navigation.navigate("InviteAccountCreation");
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const resendOtp = async () => {
    setLoading(true);
    const { error } = await authSupabase.auth.signInWithOtp({ email });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Success",
        "A new verification code has been sent to your email"
      );
    }
  };

  const isRegisterDisabled = !email || loading;
  const isOtpDisabled = !otp || loading;

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
          <Text style={globalstyles.header}>Join Your Organization</Text>
          <Text style={[globalstyles.subHeader, styles.enhancedSubheader]}>
            Enter your email to join the team
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              style={[
                globalstyles.textInput,
                styles.enhancedInput,
                focusedInput === "email" && styles.focusedInput,
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {!waitingForOtp ? (
            <TouchableOpacity
              style={[
                globalstyles.buttonContainer,
                styles.enhancedButton,
                isRegisterDisabled
                  ? styles.disabledButton
                  : { backgroundColor: "#10798B" },
              ]}
              activeOpacity={0.7}
              onPress={handleSubmit}
              disabled={isRegisterDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={[
                    globalstyles.buttonText,
                    { color: isRegisterDisabled ? "#888" : "#fff" },
                  ]}
                >
                  Send Verification Code
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.otpSection}>
              <View style={styles.otpHeader}>
                <Text style={styles.otpTitle}>Verify Your Email</Text>
                <Text style={styles.otpSubtitle}>
                  We've sent a verification code to {email}
                </Text>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  placeholder="Enter the 6-digit code"
                  style={[
                    globalstyles.textInput,
                    styles.enhancedInput,
                    focusedInput === "otp" && styles.focusedInput,
                  ]}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={6}
                  onFocus={() => setFocusedInput("otp")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <TouchableOpacity
                style={[
                  globalstyles.buttonContainer,
                  styles.enhancedButton,
                  isOtpDisabled
                    ? styles.disabledButton
                    : { backgroundColor: "#10798B" },
                ]}
                onPress={handleVerifyOtp}
                activeOpacity={0.7}
                disabled={isOtpDisabled}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text
                    style={[
                      globalstyles.buttonText,
                      { color: isOtpDisabled ? "#888" : "#fff" },
                    ]}
                  >
                    Verify Email
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={resendOtp} disabled={loading}>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  logoContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 25,
  },
  headerContainer: {
    marginBottom: 20,
  },
  enhancedSubheader: {
    marginTop: 8,
    color: "#555",
  },
  formContainer: {
    marginTop: 5,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
    paddingLeft: 4,
  },
  enhancedInput: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
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
  enhancedButton: {
    borderRadius: 8,
    paddingVertical: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#D9E2E5",
    borderColor: "#D9E2E5",
  },
  errorText: {
    color: "#E63946",
    fontSize: 13,
    marginTop: 4,
    paddingLeft: 4,
  },
  otpSection: {
    marginTop: 5,
  },
  otpHeader: {
    marginBottom: 20,
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  otpSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  resendText: {
    color: "#666",
    fontSize: 14,
  },
  resendLink: {
    color: "#10798B",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default InviteRegister;
