import { Routes } from '@angular/router';
import { CourseDetails } from './components/course-details/course-details';
import { Home } from './components/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {path: 'course/:id',component: CourseDetails }
];
