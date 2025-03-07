import { db } from "@/server/db";
import { type Page } from "@prisma/client";
import { s3 } from "@/server/clients/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

interface CreatePageInput {
  userId: string;
  slug: string;
  name?: string;
  description?: string;
  companyUrl?: string;
  imageUrl?: string;
  color?: string;
}

interface GetS3PresignedUrlInput {
  pageId: string;
  fileName: string;
  bucketName: string;
  contentType: string;
  contentLength: number;
}

interface GetS3PresignedUrlOutput {
  presignedUrl: string;
  publicUrl: string;
}

export class PageService {
  static instance: PageService | null = null;

  constructor() {
    if (!PageService.instance) {
      PageService.instance = this;
    }
    return PageService.instance;
  }

  async getFirstForUser(id: string): Promise<Page | null> {
    return await db.page.findFirst({
      where: { userId: id },
    });
  }

  async create({
    userId,
    slug,
    name,
    description,
    companyUrl,
    imageUrl,
    color,
  }: CreatePageInput): Promise<void> {
    await db.page.create({
      data: {
        userId,
        slug,
        name,
        description,
        companyUrl,
        imageUrl,
        color,
      },
    });
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    return await db.page.findUnique({
      where: { slug },
    });
  }

  async getS3PresignedUrl({
    bucketName,
    pageId,
    fileName,
    contentType,
    contentLength,
  }: GetS3PresignedUrlInput): Promise<GetS3PresignedUrlOutput> {
    const res = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `${pageId}/${fileName}`,
        ContentType: contentType,
        ContentLength: contentLength,
      }),
      { expiresIn: 60 },
    );

    const publicUrl = `${process.env.STORAGE_PUBLIC_URL}/${pageId}/${fileName}`;

    return {
      presignedUrl: res,
      publicUrl,
    };
  }

  async updatePageImageUrl(pageId: string, url: string | null): Promise<void> {
    await db.page.update({
      where: { id: pageId },
      data: { imageUrl: url },
    });
  }

  async updatePageMetadata(
    pageId: string,
    metadata: {
      name: string | null;
      desc: string | null;
    },
  ): Promise<void> {
    await db.page.update({
      where: { id: pageId },
      data: {
        name: metadata.name,
        description: metadata.desc,
      },
    });
  }
}

export const pageService = new PageService();
