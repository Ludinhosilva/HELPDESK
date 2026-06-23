"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  isOwn: boolean;
}

interface CommentSectionProps {
  ticketId: string;
  comments: Comment[];
  currentUserId: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString("es-PE", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentSection({
  ticketId,
  comments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setLocalComments((prev) => [
          ...prev,
          {
            id: newComment.id,
            content: newComment.content,
            authorName: newComment.author?.name || "You",
            authorId: currentUserId,
            createdAt: newComment.createdAt || new Date().toISOString(),
            isOwn: true,
          },
        ]);
        setContent("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {localComments.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin comentarios aún</p>
      )}

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {localComments.map((comment) => (
          <div
            key={comment.id}
            className={`flex gap-3 ${comment.isOwn ? "flex-row-reverse" : ""}`}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs bg-muted">
                {getInitials(comment.authorName)}
              </AvatarFallback>
            </Avatar>
            <div
              className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                comment.isOwn
                  ? "bg-primary/10 ml-auto"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-xs">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(comment.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un comentario..."
          className="min-h-[60px] resize-none"
          rows={2}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || submitting}
          className="shrink-0 self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
