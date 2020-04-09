import { UserData } from '../user/user.interface';
import { CourseEntity } from './course.entity';
import { UserEntity } from 'src/user/user.entity';
import { ChapterEntity } from 'src/chapter/chapter.entity';
import { UserToTutorials } from 'src/user/user-tutorials.entity';
interface Comment {
  body: string;
}

interface ArticleData {
  slug: string;
  title: string;
  description: string;
  body?: string;
  tagList?: string[];
  createdAt?: Date
  updatedAt?: Date
  favorited?: boolean;
  favoritesCount?: number;
  author?: UserData;
}

export interface CommentsRO {
  comments: Comment[];
}

export interface CourseRO {
  course: CourseEntity;
}

export interface CoursesRO {
  courses: CourseEntity[];
  coursesCount: number;
}

export interface TutorialAndCompleted {
  tutorialId: string;
  isCompleted: boolean;
}

export interface NewUserEntity {
  id: string;
  email: string;
  username: string;
  lastname: string;
  tutorialStatus: TutorialAndCompleted[];
}

export interface MonitoringCourseEntity {

  id: string;

  slug: string;

  title: string;

  description: string;

  body: string;

  card_description: string;

  course_overview: string;

  img_url: string;

  created: Date;

  updated: Date;

  chapters: ChapterEntity[];

}

export interface CoursesWithStudentsDTO {
  courses: MonitoringCourseEntity[];
  user: NewUserEntity[];

}







export interface CreateSamplePostDTO {
  name: string;
  userId?: string;
}


export interface CreateSampleUserDTO {
  name: string;
  postId?: string;
}






export interface UserWithCourses {
  courses: CourseEntity[];
  users: UserEntity[];
}


export interface UserAndTutorial {
  user: UserEntity;
  tutorials: UserToTutorials[];
}