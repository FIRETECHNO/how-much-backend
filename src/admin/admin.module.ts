import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import UserModel from 'src/user/models/user.model';
import JobReservationModel from 'src/job-form/models/job-reservation.model';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [UserModel, JobReservationModel]
})
export class AdminModule { }
