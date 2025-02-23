import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { LessonService } from './lesson.service';
import { FilesInterceptor } from '@nestjs/platform-express';

// types
import { Lesson } from 'src/course/interfaces/lesson.interface';

// all about MongoDB
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LessonClass } from 'src/course/schemas/lesson.schema';
import { HomeworkClass } from './schemas/homework.schema';

import YaCloud from 'src/s3/bucket';
const sharp = require('sharp');

@Controller('lesson')
export class LessonController {
  constructor(
    @InjectModel('Lesson') private LessonModel: Model<LessonClass>,
    @InjectModel('Homework') private HomeworkModel: Model<HomeworkClass>,
    private readonly lessonService: LessonService
  ) { }

  @Post('images')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query('lesson_id') lesson_id: String,
  ) {
    let filenames = [];

    for (let file of files) {
      if (file.originalname.startsWith('logo')) {
        file.buffer = await sharp(file.buffer).resize(300, 300).toBuffer()
      }
      let uploadResult = await YaCloud.Upload({
        file,
        path: 'lessons',
        fileName: file.originalname,
      });
      filenames.push(uploadResult.Location);
    }
    let setObj = {};
    if (filenames[0]) { setObj['images.logo'] = filenames[0]; }

    return await this.LessonModel.findByIdAndUpdate(lesson_id, {
      $set: setObj,
    });
  }

  @Post('update')
  async updateLesson(
    @Body('lesson') lesson: Lesson,
    @Body('newHomeworks') newHomeworks: any
  ) {
    // save new homeworks
    let hwIds = [];
    let homeworksFromDb = await this.HomeworkModel.insertMany(newHomeworks)

    for (let hwFromDb of homeworksFromDb) {
      hwIds.push(hwFromDb._id)
    }

    let lessonFromDb = await this.LessonModel.findById(lesson._id);

    if (lessonFromDb?._id) {
      lessonFromDb.name = lesson.name;
      lessonFromDb.shortDescription = lesson.shortDescription;
      lessonFromDb.links = lesson.links;
      lessonFromDb.videos = lesson.videos;
      lessonFromDb.telemostLink = lesson.telemostLink

      lessonFromDb.homework.push(...hwIds)
      lessonFromDb.markModified('homework')

      return await lessonFromDb.save()
    }
    return;
  }

  @Post('add-telemostlink')
  async updateTelemostLink(
    @Body('lesson_id') lesson_id: string,
    @Body('link') link: string,
  ) {
    let lessonFromDb = await this.LessonModel.findById(lesson_id);

    if (lessonFromDb?._id) {
      lessonFromDb.telemostLink = link

      return await lessonFromDb.save()
    }
    return;
  }

  @Post('homeworks-by-courses')
  async getHomeworksByCourses(
    @Body('courses') courses: string[]
  ) {
    return await this.HomeworkModel.find({ course: { $in: courses } }).populate({
      path: 'course',
      select: {
        images: 1,
        name: 1,
        teacher: 1,
        _id: 1,
      },
    })
  }

  @Post('lessons-by-courses')
  async getLessonsByCourses(
    @Body('courses') courses: string[]
  ) {
    return await this.LessonModel.find({ course: { $in: courses } })
  }

  @Post('add-homework')
  async addHomework(
    @Body('newHomework') homework: any,
    @Body('lessonId') lessonId: string,
  ) {
    let hwFromDb = await this.HomeworkModel.create(homework);

    if (hwFromDb._id) {
      let res = await this.LessonModel.findByIdAndUpdate(lessonId, { $push: { homework: hwFromDb._id } })
      return hwFromDb
    }

    return null;
  }

  @Post('upload/archives')
  @UseInterceptors(FilesInterceptor('files', 10)) // 'files' is the form field name, max 10 files
  async uploadArchives(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('homework_id') homeworkId: string) {

    const fileNames = files.map(file => {
      let spl = file.path.split('/');
      spl.splice(0, 1) // path is public/solutions/..., we dont need public in out path
      return spl.join('/')
    });

    let hwFromDb = await this.HomeworkModel.findById(homeworkId);
    if (hwFromDb?._id) {
      hwFromDb.materials['archives'].push(...fileNames)
      // await this.HomeworkModel.findByIdAndUpdate(homeworkId, { materials: fileNames })
      hwFromDb.markModified('materials.archives')
      return await hwFromDb.save()
    }
    return null
  }

  @Post('add-video')
  async addVideo(
    @Body('lessonId') lessonId: string,
    @Body('videoUrl') videoUrl: string
  ) {
    return await this.LessonModel.findByIdAndUpdate(lessonId, { $push: { videos: videoUrl } })
  }
}
