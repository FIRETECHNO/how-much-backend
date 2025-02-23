import { Module } from '@nestjs/common';
import { SolutionService } from './solution.service';
import { SolutionController } from './solution.controller';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

import SolutionModel from './models/solution.model';
import UserModel from 'src/user/models/user.model';

@Module({
  imports: [
    SolutionModel,
    UserModel,
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          let destination = req.query.destination;

          let uploadPath = `public/solutions/${destination}/solution-any-files/`;

          if (req.path == '/solution/upload/folder') {
            let splitted = file.originalname.split('___')
            splitted.splice(splitted.length - 1, 1) // remove filename

            let uploadTo = splitted.join('/')
            uploadPath = `public/solutions/${destination}/solution-folders/` + uploadTo; // Specify where to save uploads
          }

          if (req.path == '/solution/upload/archives') {
            uploadPath = `public/solutions/${destination}/solution-archives/`;
          }

          if (req.path == '/solution/upload/any-files') {
            uploadPath = `public/solutions/${destination}/solution-any-files/`;
          }

          if (req.path == '/solution/upload/code') {
            uploadPath = `public/solutions/${destination}/solution-code/`;
          }

          fs.mkdirSync(uploadPath, { recursive: true })
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          let filename = file.originalname;

          if (req.path == '/solution/upload/folder') {
            let spl = filename.split('___')
            filename = spl[spl.length - 1]
          }

          cb(null, filename); // Custom filename
        },
      }),
    }),
  ],
  controllers: [SolutionController],
  providers: [SolutionService],
})
export class SolutionModule { }
