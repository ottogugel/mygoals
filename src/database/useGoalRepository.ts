import { useSQLiteContext } from 'expo-sqlite/next';
// NAVIGATE
import { useNavigation } from "expo-router";

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

  const navigation = useNavigation();
  const database = useSQLiteContext()

  // MÉTODO DE CRIAR
  function create(goal: GoalCreateDatabase) {
    try {
    const statement = database.prepareSync(
      "INSERT INTO goals (name, total) VALUES ($name, $total)"
    )

    statement.executeSync({
      $name: goal.name,
      $total: goal.total,
    })
    } catch (error) {
      throw error
    }
  }
  // MÉTODO DE LOCALIZAR
  function all() {
    try {
      return database.getAllSync<GoalResponseDatabase>(`
        SELECT g.id, g.name, g.total, COALESCE(SUM(t.amount), 0) AS current
        FROM goals AS g
        LEFT JOIN transactions t ON t.goal_id = g.id
        GROUP BY g.id, g.name, g.total;
      `)
    } catch (error) {
      throw error
    }
  }

  // MÉTODO DE APARECER A META
  function show(id: number) {
    const statement = database.prepareSync(`
    SELECT g.id, g.name, g.total, COALESCE(SUM(t.amount), 0) AS current
    FROM goals AS g
    LEFT JOIN transactions t ON t.goal_id = g.id
    WHERE g.id = $id
    GROUP BY g.id, g.name, g.total;
    `)

    const result = statement.executeSync<GoalResponseDatabase>({ $id: id })

    return result.getFirstSync()
  }

  // MÉTODO DE EXCLUIR A META JUNTO A TRANSAÇÃO.
  function remove(id: string) {
    try {
    database.runSync(
      "DELETE FROM goals WHERE id = $id",
      { $id : Number(id) }
    );

    database.runSync(
      "DELETE FROM transactions WHERE goal_id = $goal_id",
      { $goal_id: Number(id) }
    );

    navigation.goBack();
    } catch (error) {
      throw error
    }
  }

  return {
    create,
    all,
    show,
    remove
  }

}