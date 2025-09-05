import { STORY_EVENTS, STORY_CHAPTERS, STORY_PROGRESSION } from '../../constants/StoryConstants.js';

export class StoryEventSystem {
  constructor() {
    this.triggeredEvents = new Set();
    this.unlockedChapters = new Set(['PROLOGUE']);
    this.currentChapter = 'PROLOGUE';
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Check if a story event should be triggered
   * @param {string} trigger - The trigger type
   * @param {Object} data - Additional data for the trigger
   * @returns {Object|null} Story event to display, or null
   */
  checkTrigger(trigger, data = {}) {
    // Check for chapter unlocks
    const chapterUnlock = STORY_PROGRESSION.UNLOCKS.find(unlock => 
      unlock.trigger === trigger && 
      this.evaluateCondition(unlock, data) &&
      !this.unlockedChapters.has(unlock.chapter)
    );

    if (chapterUnlock) {
      this.unlockedChapters.add(chapterUnlock.chapter);
      this.currentChapter = chapterUnlock.chapter;
      return {
        type: 'chapter',
        chapter: chapterUnlock.chapter,
        data: STORY_CHAPTERS[chapterUnlock.chapter]
      };
    }

    // Check for story events
    const storyEvent = STORY_PROGRESSION.EVENTS.find(event => 
      event.trigger === trigger &&
      this.evaluateCondition(STORY_EVENTS[event.event], data) &&
      !this.triggeredEvents.has(event.event)
    );

    if (storyEvent) {
      this.triggeredEvents.add(storyEvent.event);
      return {
        type: 'event',
        event: storyEvent.event,
        data: STORY_EVENTS[storyEvent.event]
      };
    }

    return null;
  }

  /**
   * Evaluate a condition for story triggers
   * @param {Object} condition - The condition to evaluate
   * @param {Object} data - The data to check against
   * @returns {boolean} Whether the condition is met
   */
  evaluateCondition(condition, data) {
    if (!condition || !condition.condition) return true;

    const { condition: cond } = condition;
    
    switch (cond.type || 'count') {
      case 'count':
        return data.count >= (cond.count || 1);
      case 'score':
        return data.score >= (cond.score || 0);
      case 'time':
        return data.time >= (cond.time || 0);
      case 'kills':
        return data.kills >= (cond.kills || 0);
      case 'weapons':
        return data.weapons >= (cond.weapons || 0);
      default:
        return true;
    }
  }

  /**
   * Get the current chapter
   * @returns {string} Current chapter ID
   */
  getCurrentChapter() {
    return this.currentChapter;
  }

  /**
   * Get all unlocked chapters
   * @returns {Array} Array of unlocked chapter IDs
   */
  getUnlockedChapters() {
    return Array.from(this.unlockedChapters);
  }

  /**
   * Get all triggered events
   * @returns {Array} Array of triggered event IDs
   */
  getTriggeredEvents() {
    return Array.from(this.triggeredEvents);
  }

  /**
   * Check if a chapter is unlocked
   * @param {string} chapterId - Chapter ID to check
   * @returns {boolean} Whether the chapter is unlocked
   */
  isChapterUnlocked(chapterId) {
    return this.unlockedChapters.has(chapterId);
  }

  /**
   * Check if an event has been triggered
   * @param {string} eventId - Event ID to check
   * @returns {boolean} Whether the event has been triggered
   */
  isEventTriggered(eventId) {
    return this.triggeredEvents.has(eventId);
  }

  /**
   * Reset the story system (for new game)
   */
  reset() {
    this.triggeredEvents.clear();
    this.unlockedChapters.clear();
    this.unlockedChapters.add('PROLOGUE');
    this.currentChapter = 'PROLOGUE';
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get story progress percentage
   * @returns {number} Progress percentage (0-100)
   */
  getProgress() {
    const totalChapters = Object.keys(STORY_CHAPTERS).length;
    const unlockedChapters = this.unlockedChapters.size;
    return Math.round((unlockedChapters / totalChapters) * 100);
  }

  /**
   * Get next chapter to unlock
   * @returns {string|null} Next chapter ID or null if all unlocked
   */
  getNextChapter() {
    const allChapters = Object.keys(STORY_CHAPTERS);
    const currentIndex = allChapters.indexOf(this.currentChapter);
    
    if (currentIndex < allChapters.length - 1) {
      return allChapters[currentIndex + 1];
    }
    
    return null;
  }

  /**
   * Get story statistics
   * @returns {Object} Story statistics
   */
  getStats() {
    return {
      currentChapter: this.currentChapter,
      unlockedChapters: this.unlockedChapters.size,
      totalChapters: Object.keys(STORY_CHAPTERS).length,
      triggeredEvents: this.triggeredEvents.size,
      totalEvents: Object.keys(STORY_EVENTS).length,
      progress: this.getProgress(),
      nextChapter: this.getNextChapter()
    };
  }
}

// Create a singleton instance
export const storyEventSystem = new StoryEventSystem();
