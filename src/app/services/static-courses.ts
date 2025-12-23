import { Injectable } from '@angular/core';
import { ICourse } from '../models/i-course';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StaticCourses {
  private apiUrl = '/api/course';
  private finishedCourses: Set<string> = new Set();


  constructor(private http: HttpClient) {
    this.loadFinishedCourses();
  }
  
  getAllCourses(): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(`${this.apiUrl}/list`);
  }
  getCourseById(id: string): Observable<ICourse> {
    return this.http.get<ICourse>(`${this.apiUrl}/${id}`);
  }
  markCourseAsFinished(courseId: string) {
  this.finishedCourses.add(courseId);
  this.saveFinishedCourses();
}

  isCourseFinished(courseId: string): boolean {
    return this.finishedCourses.has(courseId);
  }

  //saveFinishedCourses - Saves the list of completed courses to browser storage
  saveFinishedCourses() {
    const ids = Array.from(this.finishedCourses);
    localStorage.setItem('finished_courses', JSON.stringify(ids));
  }

  //// Restore finished courses from localStorage
  loadFinishedCourses() {
    const saved = localStorage.getItem('finished_courses');
    if (saved) {
      this.finishedCourses = new Set(JSON.parse(saved));
    }
}
  
}

  

