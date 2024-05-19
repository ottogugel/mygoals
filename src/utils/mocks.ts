import dayjs from "dayjs"
import { currencyFormat } from "./currencyFormat"

const transactions = [
  {
    id: "1",
    created_at: dayjs(new Date()).format("ddd, MMMM D, YYYY h:mm A"),
    amount: 100,
  },
  {
    id: "2",
    created_at: dayjs(new Date()).format("ddd, MMMM D, YYYY h:mm A"),
    amount: -90,
  },
];

const goal = {
  id: "1",
  name: "Computer",
  current: 2500,
  total: 3000,
  percentage: (2500 / 3000) * 100,
  transactions,
}

const goals = [goal]

export const mocks = {
  goal,
  goals,
  transactions,
}
