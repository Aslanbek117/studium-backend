import { CourseEntity } from "../course/course.entity";

export interface UserData {
  username: string;
  lastname: string;
  course: string;
  email: string;
  id: number;
  token: string;
  role: string;
  bio: string;
  image?: string;
  courses: CourseEntity[];
}

export interface UserRO {
  user: UserData;
}