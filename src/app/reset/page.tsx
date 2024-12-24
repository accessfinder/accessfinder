import { reset } from "./actions";

export default function Page() {
  return (
    <form>
      <label htmlFor="email">New Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={reset}>Change Password</button>
    </form>
  );
}
