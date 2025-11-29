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
            console.log('📖 Resumed at:', lastChapter.title);
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
      console.log('📊 Loaded progress:', completedIds);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }
}
saveProgress() {
  const completedIds = Array.from(this.completedChapters);
  localStorage.setItem(`progress_${this.courseId}`, JSON.stringify(completedIds));
  console.log('💾 Saved progress:', completedIds);
}
  

  /**
   * saveVideoPosition - Saves the current video playback position to localStorage
   * Called automatically via (timeupdate) event in HTML
   */
  saveVideoPosition() {
    const video = this.videoPlayer?.nativeElement;
    console.log('💾 saveVideoPosition called', {
      hasVideo: !!video,
      hasChapter: !!this.currentChapter,
      courseId: this.courseId,
      chapterId: this.currentChapter?.id
    });
    
    if (!video || !this.currentChapter) {
      console.log('❌ Exiting early - missing video or chapter');
      return;
    }

    const currentTime = video.currentTime;
    const key = this.getStorageKey();
    
    console.log('💾 Saving:', { key, currentTime });
    localStorage.setItem(key, currentTime.toString());
    console.log('✅ Saved successfully!');
  }

  /**
   * restoreVideoPosition - Retrieves and sets the video to previously saved position
   * Called automatically via (loadedmetadata) event in HTML
   */
  restoreVideoPosition() {
    const video = this.videoPlayer?.nativeElement;
    console.log('▶️ restoreVideoPosition called', {
      hasVideo: !!video,
      hasChapter: !!this.currentChapter
    });
    
    if (!video || !this.currentChapter) {
      console.log('❌ Exiting early - missing video or chapter');
      return;
    }

    const key = this.getStorageKey();
    const savedTime = localStorage.getItem(key);
    
    console.log('▶️ Attempting restore:', { key, savedTime });

    if (savedTime) {
      const time = parseFloat(savedTime);
      if (!isNaN(time) && time > 0) {
        video.currentTime = time;
        console.log(`✅ Restored video to ${time} seconds`);
      }
    } else {
      console.log('ℹ️ No saved position found');
    }
  }

  /**
   * getStorageKey - Generates a unique localStorage key for the current video
   */
  getStorageKey() {
    const key = `video_position_${this.courseId}_${this.currentChapter?.id}`;
    console.log('🔑 Generated key:', key);
    return key;
  }

  /**
   * selectChapter - Handles chapter selection when user clicks a chapter
   */
  /**
 * selectChapter - Handles chapter selection when user clicks a chapter
 */
  selectChapter(chapter: IChapter) { 

    if (this.currentChapter) {
      this.saveVideoPosition();
    }
    
    this.currentChapter = chapter;
    
    // Save which chapter user is watching
    localStorage.setItem(`last_chapter_${this.courseId}`, chapter.id);
    console.log('💾 Saved last chapter:', chapter.title);
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

  /**
 * playNextChapter - Automatically plays the next chapter when current video ends
 */
playNextChapter() {
  if (!this.course?.chapters || !this.currentChapter) return;

  // Mark current chapter as completed
  this.completedChapters.add(this.currentChapter.id);
  this.completedCount = this.completedChapters.size;
  
  // Save completion progress
  this.saveProgress();
  
  console.log('✅ Completed:', this.currentChapter.title);
  
  const currentIndex = this.course.chapters.findIndex(
    ch => ch.id === this.currentChapter?.id
  );
  
  // Check if there's a next chapter
  if (currentIndex !== -1 && currentIndex < this.course.chapters.length - 1) {
    const nextChapter = this.course.chapters[currentIndex + 1];
    console.log('▶️ Next:', nextChapter.title);
    
    this.saveVideoPosition();
    this.currentChapter = nextChapter;
    
    // Save which chapter is now playing
    localStorage.setItem(`last_chapter_${this.courseId}`, nextChapter.id);
  } else {
    console.log('🎉 Course completed!');
  }
}
}