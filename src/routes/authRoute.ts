import { Hono } from "hono";
import { apiResponse, applyCookie } from "@/utils/common";
import { validateRequest } from "@/middlewares/validateRequest";
import { loginSchema } from "@/utils/schemas";
import { authService } from "@/services/authService";
import { getCookie } from "hono/cookie";
import { AuthError } from "@/utils/errors";
import { refreshTokenService } from "@/services/refreshTokenService";

const authRouter = new Hono();

authRouter.post("/login", validateRequest(loginSchema), async (c) => {
  // read
  const requestData = c.req.valid("json");
  // process
  const authResponse = await authService.login(requestData);
  const refreshTokenCookie = refreshTokenService.createRefreshTokenCookie(
    authResponse.refreshToken,
  );
  // return
  applyCookie(c, refreshTokenCookie);
  return c.json(apiResponse({ accessToken: authResponse.accessToken }));
});

authRouter.post("/refresh", async (c) => {
  // read
  const refreshToken = getCookie(c, "refreshToken");
  if (!refreshToken) {
    throw new AuthError("Login required, no refresh token found");
  }
  // process
  const response = await refreshTokenService.refreshAccessToken(refreshToken);
  const cookie = refreshTokenService.createRefreshTokenCookie(response.refreshToken);
  // return
  applyCookie(c, cookie);
  return c.json(apiResponse({ accessToken: response.accessToken }));
});

export default authRouter;
