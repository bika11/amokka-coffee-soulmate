
import { ChatBot } from "./ChatBot";
import { memo } from "react";

export const AppChatBot = memo(() => {
  return <ChatBot />;
});

AppChatBot.displayName = "AppChatBot";
