-- AlterTable
ALTER TABLE "public"."Block" ADD COLUMN     "config" JSONB DEFAULT '{}',
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "content" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "articleId" INTEGER,
ADD COLUMN     "blogPostId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "public"."BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
