import { forgot } from "./actions";

export default function Page() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <button formAction={forgot}>Send Password Reset Email</button>
    </form>
  );
}
