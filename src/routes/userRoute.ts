import { userService } from "@/services/userService";
import { apiResponse } from "@/utils/common";
import type { AppEnv } from "@/utils/types";
import { Hono } from "hono";

const userRouter = new Hono<AppEnv>();

userRouter.get("/me", async (c) => {
  const userId = c.get("userId") as string;
  const response = await userService.getUserInfo(userId);
  return c.json(apiResponse(response));
});

export default userRouter;
