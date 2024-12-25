import LinksTopBar from "@/components/links-top-bar";
import { UserTopBar } from "@/components/user-top-bar";
import Link from "next/link";

export default function TopBar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/">Access Finder</Link>
        <LinksTopBar className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserTopBar />
        </div>
      </div>
    </div>
  );
}
