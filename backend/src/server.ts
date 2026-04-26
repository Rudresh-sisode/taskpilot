import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pino } from "pino";
import { globalLimiter } from "./middleware/rateLimit.js";
import { auth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import { tasksRouter } from "./routes/tasks.js";
import { aiRouter } from "./routes/ai.js";

export const logger = pino({ transport: { target: "pino-pretty" } });

const app = express();
const PORT = Number(process.env.PORT) || 8080;

const origins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(helmet());
app.use(cors({ origin: origins }));
app.use(express.json());
app.use(globalLimiter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, data: { status: "healthy" } });
});

app.use("/api/tasks", auth, tasksRouter);
app.use("/api/tasks", auth, aiRouter);

app.use(errorHandler);

app.listen(PORT, () => logger.info(`Server running on :${PORT}`));

export default app;
