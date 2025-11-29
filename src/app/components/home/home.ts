import { Component, OnInit } from '@angular/core';
import { ICourse } from '../../models/i-course';
import { StaticCourses } from '../../services/static-courses';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [CommonModule,NgFor],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{

  constructor( private StaticCourses : StaticCourses,private router: Router){}

  courses:ICourse[]= [];

  ngOnInit() {
  this.StaticCourses.getAllCourses().subscribe({
    next: (data: any) => {
      this.courses = data.result; 
      console.log('Courses loaded:', this.courses);
    },
    error: (err) => {
      console.error('Error loading courses:', err);
    }
  });
}
goToCourseDetails(courseId: string) {
  console.log('Button clicked! Course ID:', courseId);
  this.router.navigate(['/course', courseId]);
}

}
