
function getBlogStats(text: string): { wordCount: number; readingTime: number } {
    if (!text) {
      return { wordCount: 0, readingTime: 0 };
    }
  
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const averageWordsPerMinute = 200;
    const readingTime = Math.ceil(wordCount / averageWordsPerMinute);
  
    return { wordCount, readingTime };
  }

export default getBlogStats;
  