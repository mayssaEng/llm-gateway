import { Router, Request, Response } from "express";
import { OpenAIProvider } from "../providers/openai.provider";

const router = Router();
const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY!);

router.post("/completions", async (req: Request, res: Response) => {
  try {
    const result = await openaiProvider.complete(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;