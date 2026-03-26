import { ChatApp } from "@/components/chat/chat-app";
import { requireUser } from "@/lib/auth";

export default async function ChatPage() {
  const user = await requireUser();
  return <ChatApp user={user} />;
}