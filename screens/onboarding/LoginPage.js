import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { authSupabase } from "../../api/supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [waitingForOtp, setWaitingForOtp] = useState(false);
  const navigation = useNavigation();

  // Function to send OTP
  const handleLogin = async () => {
    const { error } = await authSupabase.auth.signInWithOtp({ email });

    if (error) {
      Alert.alert("Login Error", error.message);
    } else {
      Alert.alert("Check Your Email", "Enter the OTP code sent to your email.");
      setWaitingForOtp(true);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const { data, error } = await authSupabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        Alert.alert("Verification Error", error.message);
        return;
      }

      Alert.alert("Success", "You are registered and logged in!");
      setWaitingForOtp(false); // Close modal
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // Automatically check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await authSupabase.auth.getUser();
      if (data?.user) {
        navigation.navigate("Service Directory"); // Redirect if user is already logged in
      }
    };

    checkUser();
  }, []);

  return (
    <SafeAreaView>
      <View>
        <Text>Login with OTP</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ borderBottomWidth: 1, marginBottom: 10 }}
        />
        <Button title="Send OTP Code" onPress={handleLogin} />
        {waitingForOtp && (
          <>
            <TextInput
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              style={{ borderBottomWidth: 1, marginTop: 10 }}
            />
            <Button title="Verify OTP" onPress={handleVerifyOtp} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  otpInput: {
    width: 40,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    color: "#000",
  },
  otpInputActive: {
    borderColor: "#10798B",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#10798B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Login;
