import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authSupabase } from "../../api/supabaseClient";
import { useNavigation } from "@react-navigation/native";
import globalstyles from "../../shared/globalStyles";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [waitingForOtp, setWaitingForOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const navigation = useNavigation();

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to send OTP
  const handleLogin = async () => {
    setLoading(true);

    let valid = true;
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!valid) {
      setLoading(false);
      return;
    }

    const { error } = await authSupabase.auth.signInWithOtp({ email });

    if (error) {
      Alert.alert("Login Error", error.message);
      setLoading(false);
    } else {
      Alert.alert("Check Your Email", "Enter the OTP code sent to your email.");
      setWaitingForOtp(true);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Missing OTP", "Please enter the OTP sent to your email");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authSupabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        Alert.alert("Verification Error", error.message);
        setLoading(false);
        return;
      }

      Alert.alert("Success", "You are logged in!");
      setWaitingForOtp(false);
      setLoading(false);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    const { error } = await authSupabase.auth.signInWithOtp({ email });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "A new OTP has been sent to your email");
    }
  };

  const isLoginDisabled = !email || loading;
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

        <View style={globalstyles.headerContainer}>
          <Text style={globalstyles.header}>Welcome Back</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={globalstyles.subHeader}>
            Login to your Ellis account to continue
          </Text>

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
                isLoginDisabled
                  ? styles.disabledButton
                  : { backgroundColor: "#10798B" },
              ]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoginDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[globalstyles.buttonText, { color: "#fff" }]}>
                  Continue with Email
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.otpSection}>
              <View style={styles.otpHeader}>
                <Text style={styles.otpTitle}>Enter Verification Code</Text>
                <Text style={styles.otpSubtitle}>
                  We've sent a 6-digit code to {email}
                </Text>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>OTP Code</Text>
                <TextInput
                  placeholder="Enter 6-digit code"
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
                activeOpacity={0.8}
                disabled={isOtpDisabled}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[globalstyles.buttonText, { color: "#fff" }]}>
                    Verify and Login
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

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLines} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLines} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Don't have an account?{" "}
              <Text style={styles.registerHighlight}>Sign up</Text>
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
    paddingHorizontal: 20,
  },
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
  formContainer: {
    marginTop: 20,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    marginVertical: 10,
  },

  dividerLines: {
    flex: 1,
    height: 1,
    backgroundColor: "#909899",
  },

  dividerText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: "#909899",
    fontFamily: "gabarito-regular",
    fontWeight: 400,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  registerLink: {
    alignItems: "center",
    paddingVertical: 10,
  },
  registerText: {
    color: "#666",
    fontSize: 15,
  },
  registerHighlight: {
    color: "#10798B",
    fontWeight: "600",
  },
});

export default Login;
