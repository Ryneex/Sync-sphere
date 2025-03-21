import { ACCESS_TOKEN_SECRET } from "../config/config.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

interface JwtPayload extends jwt.JwtPayload {
  _id: string;
  googleId?: string;
  email: string;
  name: string;
}

const verifyJWT = asyncHandler(async (req, _, next) => {
  console.log("req object", req);
  try {
    const accessToken =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("access token", accessToken);

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request accessToken not found");
    }
    const decodedToken = jwt.verify(
      accessToken,
      ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    // console.log(decodedToken);

    const user = await User.findById(decodedToken?._id);
    // console.log(user);

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized error");
  }
});

export { verifyJWT };
