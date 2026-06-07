-- CreateTable
CREATE TABLE "public"."_PageCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PageCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_BlogPostCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BlogPostCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ArticleCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArticleCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PageCategories_B_index" ON "public"."_PageCategories"("B");

-- CreateIndex
CREATE INDEX "_BlogPostCategories_B_index" ON "public"."_BlogPostCategories"("B");

-- CreateIndex
CREATE INDEX "_ArticleCategories_B_index" ON "public"."_ArticleCategories"("B");

-- AddForeignKey
ALTER TABLE "public"."_PageCategories" ADD CONSTRAINT "_PageCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PageCategories" ADD CONSTRAINT "_PageCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlogPostCategories" ADD CONSTRAINT "_BlogPostCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlogPostCategories" ADD CONSTRAINT "_BlogPostCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArticleCategories" ADD CONSTRAINT "_ArticleCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArticleCategories" ADD CONSTRAINT "_ArticleCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
