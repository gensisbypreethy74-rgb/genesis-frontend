import { redirect } from "next/navigation";

/** Sign-in lives at /sign-in; anyone who types /login is sent there. */
export default function LoginPage() {
  redirect("/sign-in");
}
