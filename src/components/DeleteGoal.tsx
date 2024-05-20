import { Entypo } from "@expo/vector-icons";
import { colors } from "@/styles/colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Alert, View } from "react-native";

// DATABASE
import { useGoalRepository } from "@/database/useGoalRepository";


export function DeleteGoal() {

  const useGoal = useGoalRepository()

  function handleRemoveGoal() {
    Alert.alert("Delete", `Do you want to delete this goal?`, [
      {
        text: "Cancel",
      },
      {
        text: "Remove",
        onPress: () => useGoal.remove(),
      },
    ]);
  }

  return (
    <View className="absolute top-14 left-96">
      <TouchableOpacity
        onPress={handleRemoveGoal}
      >
        <Entypo name="trash" size={24} color={colors.red[500]} />
      </TouchableOpacity>
    </View>
  );
}
