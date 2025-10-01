import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';


// all about MongoDB
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserClass } from 'src/user/schemas/user.schema';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @InjectModel('User') private UserModel: Model<UserClass>,
  ) { }

  @Post("employers/not-moderated")
  async getNotModeratedEmployers(
  ) {
    let query = {
      isModerated: false,
      roles: "employer"
    }
    return await this.UserModel.find(query)
  }

  @Post("employers/moderate")
  async moderateEmployer(
    @Body("userId") userId: string,
    @Body("value") value: boolean
  ) {
    try {
      if (value == true) {
        return await this.UserModel.findByIdAndUpdate(userId, { isModerated: true })
      } else {
        return await this.UserModel.findByIdAndDelete(userId)
      }
    } catch (error) {
      return error
    }
  }
}
