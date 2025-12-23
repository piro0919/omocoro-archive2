"use server";
import { cookies } from "next/headers";

export async function setIsNotOnigiri(isNotOnigiri: boolean): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set("is-not-onigiri", isNotOnigiri.toString(), {
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
    secure: true,
  });
}

export async function setIsNotMovie(isNotMovie: boolean): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set("is-not-movie", isNotMovie.toString(), {
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
    secure: true,
  });
}

export async function setIsNotRadio(isNotRadio: boolean): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set("is-not-radio", isNotRadio.toString(), {
    maxAge: 365 * 24 * 60 * 60,
    sameSite: "lax",
    secure: true,
  });
}
