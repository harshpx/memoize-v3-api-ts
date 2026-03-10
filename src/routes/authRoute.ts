import { Hono } from "hono";
import { apiResponse, applyCookie } from "@/utils/common";
import { validateRequest } from "@/middlewares/validateRequest";
import { emailSchema, loginSchema, signupSchema } from "@/utils/schemas";
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

authRouter.post("/verify-email", validateRequest(emailSchema), async (c) => {
  // read
  const { email } = c.req.valid("json");
  // process
  await authService.sendVerificationEmail(email, true);
  // return
  return c.json(apiResponse("Verification email sent!"));
});

authRouter.post("/signup", validateRequest(signupSchema), async (c) => {
  // read
  const requestData = c.req.valid("json");
  // process
  const authResponse = await authService.signup(requestData);
  const refreshTokenCookie = refreshTokenService.createRefreshTokenCookie(
    authResponse.refreshToken,
  );
  // return
  applyCookie(c, refreshTokenCookie);
  return c.json(apiResponse({ accessToken: authResponse.accessToken }));
});

export default authRouter;
