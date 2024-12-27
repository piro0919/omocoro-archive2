import Cookies from "universal-cookie";

export const cookies = new Cookies();

export const setCookie = (
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: "lax" | "none" | "strict";
    secure?: boolean;
  },
): void => {
  cookies.set(name, value, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    ...options,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCookie = (name: string): any => {
  return cookies.get(name);
};

export const removeCookie = (
  name: string,
  options?: { domain?: string; path?: string },
): void => {
  cookies.remove(name, {
    path: "/",
    ...options,
  });
};
