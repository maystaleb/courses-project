import { Component, OnInit } from '@angular/core';
import { ICourse } from '../../models/i-course';
import { StaticCourses } from '../../services/static-courses';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [NgFor,CommonModule,],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{

  constructor( public StaticCourses : StaticCourses,private router: Router){}

  courses:ICourse[]= [];


  //It loads all courses and marks each course as finished or not based on saved progress
  ngOnInit() {
  this.StaticCourses.getAllCourses().subscribe({
    next: (data: any) => {
      this.courses = data.result.map((course: ICourse) => ({
          ...course,
          finished: this.StaticCourses.isCourseFinished(course.id)
        }));
     
    },
  });
}

goToCourseDetails(courseId: string) {
  
  this.router.navigate(['/course', courseId]);
}

}
