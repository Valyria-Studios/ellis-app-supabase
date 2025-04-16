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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authSupabase } from "../../api/supabaseClient";
import globalstyles from "../../shared/globalStyles";

const Register = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [agreedError, setAgreedError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [otp, setOtp] = useState("");
  const [waitingForOtp, setWaitingForOtp] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const toggleAgree = () => {
    setAgreed(!agreed);
    if (agreed === false) {
      setAgreedError("");
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function to handle registration
  const handleSubmit = async () => {
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

    if (!agreed) {
      setAgreedError("You must accept our Terms of Use");
      valid = false;
    } else {
      setAgreedError("");
    }

    if (!valid) {
      setLoading(false);
      return;
    }

    try {
      // Send OTP instead of magic link
      const { error } = await authSupabase.auth.signInWithOtp({ email });

      if (error) {
        Alert.alert("Signup Error", error.message);
        setLoading(false);
        return;
      }

      Alert.alert("Check Your Email", "Enter the OTP code sent to your email.");
      setWaitingForOtp(true);
      setLoading(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async (code) => {
    if (!code) {
      Alert.alert("Missing OTP", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await authSupabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (error) {
        Alert.alert("Verification Error", error.message);
        setLoading(false);
        return;
      }

      Alert.alert("Success", "You are registered!");
      setWaitingForOtp(false);
      setOtp("");
      setLoading(false);
      navigation.navigate("Service Directory");
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
      Alert.alert(
        "Success",
        "A new verification code has been sent to your email"
      );
    }
  };

  const isRegisterDisabled = !email || !agreed || loading;
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
          <Text style={globalstyles.header}>Create an account</Text>
          <Text style={[globalstyles.subHeader, styles.enhancedSubheader]}>
            Join Ellis to access all services
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

          <View style={styles.agreeContainer}>
            <TouchableOpacity
              style={[styles.agreeCircle, agreed && styles.checkedAgreeCircle]}
              onPress={toggleAgree}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />
            <TouchableOpacity onPress={toggleAgree} activeOpacity={0.8}>
              <Text style={styles.agreeText}>
                I agree to Ellis' privacy policy and terms of use
              </Text>
            </TouchableOpacity>
          </View>
          {agreedError ? (
            <Text style={styles.errorText}>{agreedError}</Text>
          ) : null}

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
                  Create Account
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
                onPress={() => handleVerifyOtp(otp)}
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

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLines} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLines} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginHighlight}>Log in</Text>
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
  agreeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  agreeCircle: {
    borderColor: "#10798B",
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    marginRight: 12,
  },
  checkedAgreeCircle: {
    borderColor: "#10798B",
    backgroundColor: "#10798B",
  },
  agreeText: {
    color: "#333",
    fontSize: 15,
    flex: 1,
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
  loginLink: {
    alignItems: "center",
    paddingVertical: 10,
  },
  loginText: {
    color: "#666",
    fontSize: 15,
  },
  loginHighlight: {
    color: "#10798B",
    fontWeight: "600",
  },
});

export default Register;
