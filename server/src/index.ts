import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get("/test", (_req: Request, res: Response) => {
  res.json({ status: "ok", msg: 'heyyyyy!'});
});

app.listen(PORT, () => {
  console.log(`The Block API listening on http://localhost:${PORT}`);
});
