import LoginForm from "@/components/login-form";
import { login } from "./actions";

export default function Page() {
  return <LoginForm login={login} />;
}
