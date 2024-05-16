import { useSQLiteContext } from "expo-sqlite";

export type GoalCreateDatabase = {
  name: string
  total: number
}

export type GoalResponseDatabase = {
  id: string
  name: string
  total: number
  current: number
}

export function useGoalRepository() {
  const database = useSQLiteContext()

  // MÉTODO PARA CRIAR A META
  function create(goal: GoalCreateDatabase) {
    const statement = database.prepareSync(
      "INSERT INTO goals (name, total) VALUES ($name, $total)"
    )
    statement.executeSync({
      $name: goal.name,
      $total: goal.total,
    })
    }
  }
  // MÉTODO PARA LISTAR AS METAS
  function all() {}

  return {
    create,
    all
  }
}