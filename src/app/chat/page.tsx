import { ChatApp } from "@/components/chat/chat-app";
import { getCurrentUserWithRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const user = await getCurrentUserWithRole();
  if (!user) {
    redirect("/auth");
  }
  return <ChatApp user={user} />;
}
