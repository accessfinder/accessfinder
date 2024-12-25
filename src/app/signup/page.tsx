import SignupForm from "@/components/signup-form";
import { signup } from "./actions";

export default function Page() {
  return <SignupForm signup={signup} />;
}
