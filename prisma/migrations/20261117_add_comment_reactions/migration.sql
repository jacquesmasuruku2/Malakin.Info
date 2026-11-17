CREATE TABLE IF NOT EXISTS "CommentReaction" (
  "id" STRING NOT NULL,
  "commentId" STRING NOT NULL,
  "userId" STRING NOT NULL,
  "type" STRING NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CommentReaction_commentId_fkey"
    FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CommentReaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX "CommentReaction_commentId_userId_key" ("commentId", "userId"),
  INDEX "CommentReaction_commentId_idx" ("commentId"),
  INDEX "CommentReaction_userId_idx" ("userId")
);
