//
// import { Module } from "@nestjs/common";
// import { PrismaService } from "../../../prisma/prisma/prisma.service";
// import { JwtModule } from "@nestjs/jwt";
// import { HistoryController} from "./history/history.controller";
// import { HistoryService } from "./history/history_service";
//
//
// @Module({
//   imports: [JwtModule.register({})],
//   controllers: [HistoryController],
//   providers:[HistoryService, PrismaService],
//   exports: [HistoryService]
// })
// export class HistoryModule {}