import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  UIManager,
  Platform,
} from "react-native";
import { Dropdown } from "../shared/Dropdown";
import ChecklistItem from "../shared/CheckBox";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import globalstyles from "../shared/globalStyles";
import imageMap from "../shared/getProfileImage";
import ProgressBar from "../shared/ProgressBar";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const dropdownItems = ["Housing", "Legal Assistance", "Job Placement"];
const checklistItems = [
  "Basic Information",
  "Submit Request",
  "Follow Up",
  "Housing Granted",
];
const tabItems = ["Activity", "Request", "Team", "Forms", "Notes"];

const totalItems = dropdownItems.length * checklistItems.length; // Total number of ChecklistItems

function ProfilePage({ route }) {
  const { client } = route.params;
  const [selectedItem, setSelectedItem] = useState("Activity");
  const [checkedItems, setCheckedItems] = useState(0);
  const [notes, setNotes] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/Notes")
      .then((response) => response.json())
      .then((json) => setNotes(json))
      .catch((error) => console.log("error fetching data:", error));
  }, []);

  const onNotePress = (noteId) => {
    setSelectedNote(notes[noteId]);
  };

  const handleBackToNotes = () => {
    setSelectedNote(null);
  };

  // Callback for when a checklist item is toggled
  const handleChecklistToggle = (isItemChecked) => {
    setCheckedItems((prevCount) =>
      isItemChecked ? prevCount + 1 : prevCount - 1
    );
  };
  const progress = (checkedItems / totalItems) * 100;

  const activityContent = (
    <View>
      {dropdownItems.map((dropdownItem) => (
        <Dropdown title={dropdownItem} key={dropdownItem}>
          {checklistItems.map((checkListItem) => (
            <ChecklistItem
              title={checkListItem}
              key={checkListItem}
              onToggle={handleChecklistToggle}
            />
          ))}
        </Dropdown>
      ))}
    </View>
  );
  const formContent = <Text>form</Text>;
  const teamContent = <Text>team</Text>;
  const requestContent = <Text>request</Text>;
  const notesContent = (
    <View style={{ padding: 10 }}>
      {selectedNote ? (
        <View>
          <TouchableOpacity
            onPress={handleBackToNotes}
            style={{ marginBottom: 10 }}
          >
            {/* Using an icon for back button, you can customize this */}
            <MaterialIcons name="keyboard-arrow-left" size={24} color="black" />
          </TouchableOpacity>
          {/* Note details */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: "bold" }}>{selectedNote.title}</Text>
            <Text>{selectedNote.date}</Text>
            <Text>{selectedNote.content}</Text>
          </View>
        </View>
      ) : // List all notes if none is selected
      notes.length > 0 ? (
        notes.map((note, index) => (
          <TouchableOpacity
            key={index}
            style={[
              globalstyles.optionsContainer,
              { marginVertical: 2, borderWidth: 0 },
            ]}
            onPress={() => onNotePress(index)}
          >
            <View>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteDate}>{note.date}</Text>
            </View>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={30}
              style={{ color: "#094852" }}
            />
          </TouchableOpacity>
        ))
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );

  let content;
  switch (selectedItem) {
    case "Activity":
      content = activityContent;
      break;
    case "Request":
      content = requestContent;
      break;
    case "Team":
      content = teamContent;
      break;
    case "Forms":
      content = formContent;
      break;
    case "Notes":
      content = notesContent;
      break;
    default:
      content = <Text>Default Content</Text>; // Default case
  }

  return (
    <ImageBackground source={imageMap[client.image]} style={styles.container}>
      <View style={styles.overlay} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.centerCard}>
          <View style={styles.mainText}>
            <View style={styles.header}>
              <Text style={styles.clientName}>{client.name}</Text>
              <View style={styles.iconSpacing}>
                <View style={styles.iconsContainer}>
                  <MaterialCommunityIcons
                    name="message"
                    size={18}
                    style={styles.icon}
                  />
                </View>
              </View>
            </View>
            <View style={styles.detailsContainer}>
              <View>
                <Text style={styles.details}>Age</Text>
                <Text style={styles.detailsText}>{client.age}</Text>
              </View>
              <View>
                <Text style={styles.details}>Location</Text>
                <Text style={styles.detailsText}>{client.location}</Text>
              </View>
            </View>
            <View style={globalstyles.tagContainer}>
              {client.services && Array.isArray(client.services)
                ? client.services.map((service, index) => (
                    <View key={index} style={globalstyles.tagBackground}>
                      <Text style={globalstyles.individualTags}>{service}</Text>
                    </View>
                  ))
                : null}
            </View>
            <View>
              <ProgressBar progress={progress} />
            </View>
          </View>
        </View>
        <View style={styles.serviceContainer}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={styles.serviceHeader}>
              {tabItems.map((sortItem) => (
                <TouchableOpacity
                  key={sortItem}
                  activeOpacity={1}
                  onPress={() => setSelectedItem(sortItem)}
                >
                  <View
                    style={
                      selectedItem === sortItem
                        ? styles.selectedItemContainer
                        : styles.serviceItemContainer
                    }
                  >
                    <Text style={styles.serviceHeaderItems}>{sortItem}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View>{content}</View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    resizeMode: "cover",
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255, 0.4)",
  },

  centerCard: {
    marginTop: 350,
    zIndex: 2,
  },

  scrollView: {
    flex: 1,
  },

  mainText: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,1)",
    shadowColor: "#000",
    shadowOffset: {
      width: 8, // This will add shadow to the right of the container
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconSpacing: {
    justifyContent: "space-evenly",
    flexDirection: "row",
  },

  iconsContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#10798a",
    borderColor: "#10798a",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 20,
  },

  icon: {
    color: "#ffffff",
  },

  detailsContainer: {
    flex: 1,
    flexDirection: "row",
  },

  details: {
    color: "#465355",
    margin: 10,
    fontFamily: "gabarito-regular",
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },

  detailsText: {
    fontFamily: "karla-regular",
    fontSize: 16,
    letterSpacing: -0.16,
    fontWeight: 400,
    color: "#171B1C",
    marginBottom: 10,
    marginHorizontal: 10,
  },

  clientName: {
    fontSize: 30,
    fontFamily: "gabarito-semibold",
    color: "#094852",
    marginVertical: 10,
  },

  serviceContainer: {
    zIndex: 1,
    paddingTop: 30,
    top: -10,
    flex: 1,
    backgroundColor: "#f3f8f9",
    paddingBottom: 20,
  },

  serviceHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },

  serviceItemContainer: {
    marginVertical: 10,
    marginHorizontal: 15,
  },

  selectedItemContainer: {
    borderBottomWidth: 2,
    borderColor: "#10798a",
    marginVertical: 10,
    marginHorizontal: 15,
  },

  serviceHeaderItems: {
    fontSize: 24,
    color: "#094852",
    fontFamily: "gabarito-medium",
  },

  servicesContainers: {
    borderWidth: 1,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    // additional styles
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#10798B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checked: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: "#10798B",
  },

  text: {
    fontFamily: "karla-regular",
    color: "#171B1C",
    fontSize: 16,
    letterSpacing: -0.16,
  },

  noteTitle: {
    fontFamily: "gabarito-semibold",
    fontSize: 18,
    color: "#094852",
  },

  noteDate: {
    fontFamily: "karla-regular",
    fontSize: 14,
    color: "#465355",
  },
});

export default ProfilePage;
