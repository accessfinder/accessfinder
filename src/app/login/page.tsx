import { login } from "./actions";

export default function Page() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <a href="/forgot" target="_blank">
        Forgot Password
      </a>
    </form>
  );
}
