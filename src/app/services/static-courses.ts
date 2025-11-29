import { Injectable } from '@angular/core';
import { ICourse } from '../models/i-course';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StaticCourses {
  private apiUrl = '/api/course';


  constructor(private http: HttpClient) {}
  
  getAllCourses(): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(`${this.apiUrl}/list`);
  }
  getCourseById(id: string): Observable<ICourse> {
    return this.http.get<ICourse>(`${this.apiUrl}/${id}`);
  }
}

  

