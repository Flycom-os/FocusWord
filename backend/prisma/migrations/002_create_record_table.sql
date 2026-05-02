-- CreateTable
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "template" TEXT NOT NULL DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "authorId" INTEGER,
    "featuredImageId" INTEGER,
    "featuredSliderId" INTEGER,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "metaKeywords" TEXT[],
    "contentBlocks" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "records_slug_key" ON "records"("slug");

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_authorId_fkey" FOREIGN KEY("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "records" ADD CONSTRAINT "records_featuredImageId_fkey" FOREIGN KEY("featuredImageId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "records" ADD CONSTRAINT "records_featuredSliderId_fkey" FOREIGN KEY("featuredSliderId") REFERENCES "sliders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create join table for records and categories
CREATE TABLE "_RecordToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- AddForeignKey for join table
ALTER TABLE "_RecordToCategory" ADD CONSTRAINT "_RecordToCategory_A_fkey" FOREIGN KEY("A") REFERENCES "records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_RecordToCategory" ADD CONSTRAINT "_RecordToCategory_B_fkey" FOREIGN KEY("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex for join table
CREATE UNIQUE INDEX "_RecordToCategory_AB_unique" ON "_RecordToCategory"("A", "B");
