import { UserData } from '../user/user.interface';
import { CourseEntity } from './course.entity';
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

