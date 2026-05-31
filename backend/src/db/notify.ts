import pool from "./index";

export async function createNotification(
  userId: string,
  message: string,
  type: string
): Promise<void> {
  try {
    await pool.query(
      "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)",
      [userId, message, type]
    );
  } catch {
    // Non-fatal — notification failure must never break the main operation
  }
}
