import app from "./app.js";
import connectDB from "./config/db.js";
import reminderJob from "./jobs/reminder.job.js";

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  reminderJob.start();
});