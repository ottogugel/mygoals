// LIBS
import { useEffect, useRef, useState } from "react"
import { Alert, Keyboard, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import Bottom from "@gorhom/bottom-sheet"
import dayjs from "dayjs"

// DATABASE
import { useGoalRepository } from "@/database/useGoalRepository"
import { useTransactionRepository } from "@/database/useTransactionRepository";

// COMPONENTS
import { Input } from "@/components/Input"
import { Header } from "@/components/Header"
import { Button } from "@/components/Button"
import { Loading } from "@/components/Loading"
import { Progress } from "@/components/Progress"
import { BackButton } from "@/components/BackButton"
import { BottomSheet } from "@/components/BottomSheet"
import { Transactions } from "@/components/Transactions"
import { TransactionProps } from "@/components/Transaction"
import { TransactionTypeSelect } from "@/components/TransactionTypeSelect"
import { DeleteGoal } from "@/components/DeleteGoal";

// UTILS
import { currencyFormat } from "@/utils/currencyFormat"

type Details = {
  name: string
  total: string
  current: string
  percentage: number
  transactions: TransactionProps[]
}

export default function Details() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState<"up" | "down">("up")
  const [goal, setGoal] = useState<Details>({} as Details)

  // PARAMS
  const routeParams = useLocalSearchParams()
  const goalId = Number(routeParams.id)

  // DATABASE

  const useGoal = useGoalRepository();
  const useTransaction = useTransactionRepository();


  // BOTTOM SHEET
  const bottomSheetRef = useRef<Bottom>(null)
  const handleBottomSheetOpen = () => bottomSheetRef.current?.expand()
  const handleBottomSheetClose = () => bottomSheetRef.current?.snapToIndex(0)

  function fetchDetails() {
    try {
      if (goalId) {
        const goal = useGoal.show(goalId)
        const transactions = useTransaction.findByGoal(goalId)

        if (!goal || !transactions) {
          return router.back()
        }

        setGoal({
          name: goal.name,
          current: currencyFormat(goal.current),
          total: currencyFormat(goal.total),
          percentage: (goal.current / goal.total) * 100,
          transactions: transactions.map((item) => ({
            ...item,
            date: dayjs(item.created_at).format("ddd, MMMM D, YYYY h:mm A"),
          })),
        });

        setIsLoading(false)
        console.log(goalId)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleNewTransaction() {
    try {
      let amountAsNumber = Number(amount.replace(",", "."))

      if (isNaN(amountAsNumber)) {
        return Alert.alert("Error", "Invalid value.");
      }

      if (type === "down") {
        amountAsNumber = amountAsNumber * -1
      }

      useTransaction.create({ goalId, amount: amountAsNumber });

      Alert.alert("Success", "Registered transaction!");

      handleBottomSheetClose()
      Keyboard.dismiss()

      setAmount("")
      setType("up")
      fetchDetails()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View className="flex-1 p-8 pt-12">
      <BackButton />

      <Header title={goal.name} subtitle={`${goal.current} de ${goal.total}`} />

      <Progress percentage={goal.percentage} />

      <Transactions transactions={goal.transactions} />

      <Button title="New transaction" onPress={handleBottomSheetOpen} />

      <BottomSheet
        ref={bottomSheetRef}
        title="New transaction"
        snapPoints={[0.01, 284]}
        onClose={handleBottomSheetClose}
      >
        <TransactionTypeSelect onChange={setType} selected={type} />

        <Input
          placeholder="Value"
          keyboardType="numeric"
          onChangeText={setAmount}
          value={amount}
        />

        <Button title="Confirm" onPress={handleNewTransaction} />
      </BottomSheet>

      <DeleteGoal id={goalId.toString()} />
    </View>
  );
}
