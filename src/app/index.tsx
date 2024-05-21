// LIBS
import React, { useEffect, useRef, useState } from "react";
import { Alert, View, Keyboard } from "react-native";
import Bottom from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import dayjs from "dayjs";

// COMPONENTS
import { Input } from "@/components/Input";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { BottomSheet } from "@/components/BottomSheet";
import { Goals, GoalsProps } from "@/components/Goals";
import { Transactions, TransactionsProps } from "@/components/Transactions";

//DATABASE
import { useGoalRepository } from "@/database/useGoalRepository";
import { useTransactionRepository } from "@/database/useTransactionRepository";

// UTILS
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";

const schema = z.object({
  name: z.string().max(128, { message: "O limite máximo de caracteres é 128."}),
  total: z.number().positive({ message: "Apenas números positivos."}),
})

export default function Home() {
  // LISTS
  const [transactions, setTransactions] = useState<TransactionsProps>([]);
  const [goals, setGoals] = useState<GoalsProps>([]);

  // FORM
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");

  const form = useForm({
    resolver: zodResolver(schema)
  });

  //DATABASE
  const UseGoal = useGoalRepository();
  const useTransaction = useTransactionRepository();

  // BOTTOM SHEET
  const bottomSheetRef = useRef<Bottom>(null);
  const handleBottomSheetOpen = () => bottomSheetRef.current?.expand();
  const handleBottomSheetClose = () => bottomSheetRef.current?.snapToIndex(0);

  function handleDetails(id: string) {
    router.navigate("/details/" + id);
  }

  async function handleCreate() {
    try {
      const totalAsNumber = Number(total.toString().replace(",", "."));

      if (isNaN(totalAsNumber)) {
        return Alert.alert("Error", "Invalid value.");
      }

      UseGoal.create({ name, total: totalAsNumber });

      Keyboard.dismiss();
      handleBottomSheetClose();
      Alert.alert("Success", "Goal registered!");

      setName("");
      setTotal("");
      fetchGoals();
    } catch (error) {
      Alert.alert("Error", "Unable to register.");
      console.log(error);
    }
  }

  async function fetchGoals() {
    try {
      const response = UseGoal.all()
      setGoals(response)
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchTransactions() {
    try {
      const response = useTransaction.findLatest()

      setTransactions(
        response.map((item) => ({
          ...item,
          date: dayjs(item.created_at).format("ddd, MMMM D, YYYY h:mm A"),
        }))
      );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchGoals();
    fetchTransactions();
  }, []);

  return (
    <View className="flex-1 p-8">
      <Header
        title="Your goals"
        subtitle="Save today to reap the rewards tomorrow."
      />

      <Goals
        goals={goals}
        onAdd={handleBottomSheetOpen}
        onPress={handleDetails}
      />

      <Transactions transactions={transactions} />

      <BottomSheet
        ref={bottomSheetRef}
        title="New Goal"
        snapPoints={[0.01, 284]}
        onClose={handleBottomSheetClose}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field: { value, onChange } }) => (
            <Input
              placeholder="Goal name"
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <Controller
          name="total"
          control={form.control}
          render={({ field: { value, onChange } }) => (
            <Input
              placeholder="Value"
              keyboardType="numeric"
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <Button title="Create" onPress={handleCreate} />
      </BottomSheet>
    </View>
  );
}