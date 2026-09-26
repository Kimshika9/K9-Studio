/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as catalogReads from "../catalogReads.js";
import type * as credit from "../credit.js";
import type * as http from "../http.js";
import type * as notifyQueries from "../notifyQueries.js";
import type * as orders from "../orders.js";
import type * as public_ from "../public.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as telegram from "../telegram.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  catalogReads: typeof catalogReads;
  credit: typeof credit;
  http: typeof http;
  notifyQueries: typeof notifyQueries;
  orders: typeof orders;
  public: typeof public_;
  seed: typeof seed;
  seedData: typeof seedData;
  telegram: typeof telegram;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
