import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
      <MessageSquare className="w-10 h-10 text-primary animate-bounce" />
      <p className="mt-3 text-lg font-medium text-base-content/80">
        Select a conversation to Connectt !!!
      </p>
    </div>
  );
};

export default NoChatSelected;
