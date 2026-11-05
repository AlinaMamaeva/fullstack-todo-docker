import Todo from "../models/Todo.js";

export async function getAnalytics() {
  const [result] = await Todo.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: ["$completed", 1, 0] },
        },
        pending: {
          $sum: { $cond: ["$completed", 0, 1] },
        },
        low: {
          $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] },
        },
        medium: {
          $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] },
        },
        high: {
          $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] },
        },
      },
    },
  ]);

  return {
    total: result?.total ?? 0,
    completed: result?.completed ?? 0,
    pending: result?.pending ?? 0,
    byPriority: {
      low: result?.low ?? 0,
      medium: result?.medium ?? 0,
      high: result?.high ?? 0,
    },
  };
}
