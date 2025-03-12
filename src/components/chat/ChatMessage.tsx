
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { measureRenderTime } from '@/utils/performance';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export const ChatMessage = memo(({ content, isUser }: ChatMessageProps) => {
  // Record render time for performance tracking
  const endMeasure = measureRenderTime('ChatMessage');
  
  // Memoize markdown components to avoid recreation on each render
  const markdownComponents = useMemo(() => ({
    a: ({ node, ...props }: any) => (
      <a
        {...props}
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
  }), []);

  // Only call endMeasure on actual render
  const renderedContent = useMemo(() => {
    if (isUser) {
      return content;
    } else {
      return (
        <ReactMarkdown components={markdownComponents}>
          {content}
        </ReactMarkdown>
      );
    }
  }, [content, isUser, markdownComponents]);

  // End measurement after component logic is processed
  endMeasure();

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {renderedContent}
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
