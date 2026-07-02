-- CreateEnum
CREATE TYPE "public"."EmailProviderType" AS ENUM ('SMTP', 'SENDGRID', 'MAILGUN', 'AWS_SES', 'OAUTH_GOOGLE', 'OAUTH_MICROSOFT');

-- CreateEnum
CREATE TYPE "public"."DomainStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'FAILED_VERIFICATION', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."DnsProviderType" AS ENUM ('CLOUDFLARE', 'ROUTE53', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MailboxType" AS ENUM ('INBOUND', 'OUTBOUND', 'FULL_ACCESS');

-- CreateEnum
CREATE TYPE "public"."MailboxStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "public"."EmailProvider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."EmailProviderType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "bodyText" TEXT,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Domain" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "status" "public"."DomainStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "mxRecordsSet" BOOLEAN NOT NULL DEFAULT false,
    "spfRecordSet" BOOLEAN NOT NULL DEFAULT false,
    "dkimRecordSet" BOOLEAN NOT NULL DEFAULT false,
    "dmarcRecordSet" BOOLEAN NOT NULL DEFAULT false,
    "dnsProviderType" "public"."DnsProviderType",
    "dnsProviderCredentials" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "defaultEmailProviderId" INTEGER,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mailbox" (
    "id" SERIAL NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "domainId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" "public"."MailboxType" NOT NULL,
    "credentials" JSONB DEFAULT '{}',
    "status" "public"."MailboxStatus" NOT NULL DEFAULT 'ACTIVE',
    "autoReplyMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mailbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailProvider_name_key" ON "public"."EmailProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "public"."EmailTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "public"."Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mailbox_emailAddress_key" ON "public"."Mailbox"("emailAddress");

-- AddForeignKey
ALTER TABLE "public"."Domain" ADD CONSTRAINT "Domain_defaultEmailProviderId_fkey" FOREIGN KEY ("defaultEmailProviderId") REFERENCES "public"."EmailProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mailbox" ADD CONSTRAINT "Mailbox_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "public"."Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mailbox" ADD CONSTRAINT "Mailbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
