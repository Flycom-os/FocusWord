//
// import { Module } from "@nestjs/common";
// import { PrismaService } from "../../../prisma/prisma/prisma.service";
// import { JwtModule } from "@nestjs/jwt";
// import {CommentsService } from "./comment/comment_service";
// import { CommentController} from "./comment/comment.controller";
//
//
// @Module({
//   imports: [JwtModule.register({})],
//   controllers: [CommentController],
//   providers:[CommentsService, PrismaService],
//   exports: [CommentsService]
// })
// export class CommentModule {}