import { Controller, Get, Post, Body, Patch, Param, UploadedFile, HttpCode, Delete, Query, HttpStatus, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { SolutionService } from './solution.service';

import { FilesInterceptor } from '@nestjs/platform-express';

// all about MongoDB
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SolutionClass } from './schemas/solution.schema';
import { UserClass } from 'src/user/schemas/user.schema';

@Controller('solution')
export class SolutionController {
  constructor(
    @InjectModel('Solution') private SolutionModel: Model<SolutionClass>,
    @InjectModel('User') private UserModel: Model<UserClass>,
    private readonly solutionService: SolutionService) { }

  @Post('')
  async newSolution(
    @Body('solution') solution: any
  ) {
    let solutionFromDb = await this.SolutionModel.create(solution);

    if (solution.student) {
      await this.UserModel.findByIdAndUpdate(solution.student, { $push: { sentSolutions: solutionFromDb._id } })
    }
    
    return solutionFromDb;
  }

  @Get('')
  async getAll() {
    return await this.SolutionModel.find({}).populate({
      path: 'lesson',
      select: {
        name: 1,
      }
    })
  }
  @Get('get-by-id')
  async getById(
    @Query('_id') solutionId: string
  ) {
    return await this.SolutionModel.findById(solutionId).populate({
      path: 'lesson',
      select: {
        name: 1,
      }
    })
  }

  // status, teacherComment, solutionId 
  @Post('set-teacher-response')
  async setTeacherResponse(
    @Body('status') status: string,
    @Body('teacherComment') teacherComment: string,
    @Body('solutionId') solutionId: string,
  ) {
    return await this.SolutionModel.findByIdAndUpdate(solutionId, { teacherComment: teacherComment, status: status })
  }

  @Post('upload/folder')
  @UseInterceptors(FilesInterceptor('files', 100)) // 'files' is the form field name, max 100 files
  async uploadFolder(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('solution_id') solutionId: string
  ) {
    const fileNames = files.map(file => {
      let spl = file.destination.split('/');
      spl.splice(0, 1)
      return spl.join('/')
    });

    // there is one folder
    return await this.SolutionModel.findByIdAndUpdate(solutionId, { folderPath: fileNames[0], folderPaths: fileNames })
  }

  @Post('upload/archives')
  @UseInterceptors(FilesInterceptor('files', 10)) // 'files' is the form field name, max 10 files
  async uploadArchives(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('solution_id') solutionId: string) {
    const fileNames = files.map(file => {
      let spl = file.path.split('/');
      spl.splice(0, 1) // path is public/solutions/..., we dont need public in out path
      return spl.join('/')
    });

    return await this.SolutionModel.findByIdAndUpdate(solutionId, { archives: fileNames })
  }

  @Post('upload/any-files')
  @UseInterceptors(FilesInterceptor('files', 40)) // 'files' is the form field name, max 40 files
  async uploadAnyFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('solution_id') solutionId: string) {
    const fileNames = files.map(file => {
      let spl = file.path.split('/');
      spl.splice(0, 1) // path is public/solutions/..., we dont need public in out path
      return spl.join('/')
    });

    return await this.SolutionModel.findByIdAndUpdate(solutionId, { anyFiles: fileNames })
  }

  @Post('upload/code')
  @UseInterceptors(FilesInterceptor('files', 40)) // 'files' is the form field name, max 40 files
  async uploadCode(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('solution_id') solutionId: string) {
    const fileNames = files.map(file => {
      let spl = file.path.split('/');
      spl.splice(0, 1) // path is public/solutions/..., we dont need public in out path
      return spl.join('/')
    });
    return await this.SolutionModel.findByIdAndUpdate(solutionId, { code: fileNames })
  }
}
