import { db } from "@/db/db";
import { userInfoFromEntity } from "@/utils/common";
import { DbQueryError } from "@/utils/errors";
import type { UserInfo } from "@/utils/types";

export const userService = {
  getUserInfo: async (userId: string): Promise<UserInfo> => {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
    });
    if (!user) {
      throw new DbQueryError("User not found");
    }
    return userInfoFromEntity(user);
  },
};
