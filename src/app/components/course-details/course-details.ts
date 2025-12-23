import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaticCourses } from '../../services/static-courses';
import { ICourse } from '../../models/i-course';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { IChapter } from '../../models/ichapter';

@Component({
  selector: 'app-course-details',
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails implements OnInit {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  course: ICourse | null = null;
  courseId: string = '';
  currentChapter: IChapter | null = null;
  completedChapters: Set<string> = new Set();
  completedCount: number = 0;
  

  constructor(
    private route: ActivatedRoute,
    private courseService: StaticCourses,
    private router: Router
  ) {}

  ngOnInit() {

  this.courseId = this.route.snapshot.params['id'];
  
  this.courseService.getCourseById(this.courseId).subscribe({
    next: (data) => {
      this.course = data;
      
      if (this.course.chapters && this.course.chapters.length > 0) {
        // Load saved data from localStorage
        this.loadProgress(); 
        
        // Try to restore last watched chapter
        const lastChapterId = localStorage.getItem(`last_chapter_${this.courseId}`);
        
        if (lastChapterId) {
          // Find the chapter user was watching
          const lastChapter = this.course.chapters.find(ch => ch.id === lastChapterId);
          if (lastChapter) {
            this.currentChapter = lastChapter;
            
          } else {
            // If not found, start at first chapter
            this.currentChapter = this.course.chapters[0];
          }
        } else {
          // First time visiting, start at first chapter
          this.currentChapter = this.course.chapters[0];
        }
      }
    },
  });
}

  /**
 * loadProgress - Loads saved completion status from localStorage
 * Purpose: Restore which chapters user has completed (green checkmarks)
 */
loadProgress() {
  const savedProgress = localStorage.getItem(`progress_${this.courseId}`);
  if (savedProgress) {
    try {
      const completedIds = JSON.parse(savedProgress);
      this.completedChapters = new Set(completedIds);
      this.completedCount = this.completedChapters.size;
     
    } catch (error) {
      
    }
  }
}


saveProgress() {
  const completedIds = Array.from(this.completedChapters);
  localStorage.setItem(`progress_${this.courseId}`, JSON.stringify(completedIds));
  
}
  

  /**
   * saveVideoPosition - Saves the current video playback position to localStorage
   * Called automatically via (timeupdate) event in HTML
   */
  saveVideoPosition() {
    const video = this.videoPlayer?.nativeElement;
    if (!video || !this.currentChapter) return;
      
    const currentTime = video.currentTime;
    const key = this.getStorageKey();
    
    localStorage.setItem(key, currentTime.toString());

  }

  /**
   * restoreVideoPosition - Retrieves and sets the video to previously saved position
   * Called automatically via (loadedmetadata) event in HTML
   */
  restoreVideoPosition() {
    const video = this.videoPlayer?.nativeElement;
    
    
    if (!video || !this.currentChapter) return;

    const key = this.getStorageKey();
    const savedTime = localStorage.getItem(key);
    if (savedTime) {
      const time = parseFloat(savedTime);
      if (!isNaN(time) && time > 0) {
        video.currentTime = time;
      }
    } 
  }

  /**
   * getStorageKey - Generates a unique localStorage key for the current video
   */
  getStorageKey() {
    const key = `video_position_${this.courseId}_${this.currentChapter?.id}`;
   
    return key;
  }

  // selectChapter - Handles chapter selection when user clicks a chapter
  
  selectChapter(chapter: IChapter) { 

    if (this.currentChapter) {
      this.saveVideoPosition();
    }
    
    this.currentChapter = chapter;
    
    // Save which chapter user is watching
    localStorage.setItem(`last_chapter_${this.courseId}`, chapter.id);
  
  }

  isCompleted(chapterId: string): boolean {
    return this.completedChapters.has(chapterId);
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  goBack() {
  this.saveVideoPosition();
  this.saveProgress();
  
  // Save last watched chapter
  if (this.currentChapter) {
    localStorage.setItem(`last_chapter_${this.courseId}`, this.currentChapter.id);
  }
  
  this.router.navigate(['/']);
}

//playNextChapter - Automatically plays the next chapter when current video ends
 
playNextChapter() {
  if (!this.course?.chapters || !this.currentChapter) return;

  // Mark current chapter as completed
  this.completedChapters.add(this.currentChapter.id);
  this.completedCount = this.completedChapters.size;
  
  // Save completion progress
  this.saveProgress();
  
 
  
  const currentIndex = this.course.chapters.findIndex(
    ch => ch.id === this.currentChapter?.id
  );
  
  // Check if there's a next chapter
  const nextIndex = currentIndex + 1;

  if (nextIndex < this.course.chapters.length) {
    // There IS a next chapter = play it
    this.currentChapter = this.course.chapters[nextIndex];
  } else {
    // No next chapter - this was the LAST chapter = course finished!
    this.courseService.markCourseAsFinished(this.courseId);
  }
}

}