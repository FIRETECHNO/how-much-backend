import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';


// all about MongoDB
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserClass } from 'src/user/schemas/user.schema';
import ApiError from 'src/exceptions/errors/api-error';

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

  @Post("employees/find")
  async findEmployee(
    @Body("email") email: string
  ) {
    try {
      let candidate = await this.UserModel.findOne({ email, roles: "employee" })

      return candidate
    } catch (error) {
      throw ApiError.BadRequest("Ошибка при поиске соискателя")
    }
  }
}
