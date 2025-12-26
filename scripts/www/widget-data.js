// 小组件数据接口
class WidgetData {
  constructor() {
    this.currentWeek = 21;
    this.currentWeekType = 'odd';
    this.todayCourses = [];
    this.nextCourse = null;
  }

  // 获取今日课程
  getTodayCourses() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
    const adjustedDay = dayOfWeek === 0 ? 4 : dayOfWeek - 1; // 转换为周一为0
    
    if (adjustedDay >= 0 && adjustedDay < 5) {
      // 从localStorage获取数据
      const savedData = localStorage.getItem('teacherTimetable');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          const courseData = data.courseData || {};
          
          // 收集今天的课程
          const todayCourses = [];
          for (let slot = 0; slot < 7; slot++) {
            const courseKey = `${this.currentWeek}_${adjustedDay}_${slot}`;
            if (courseData[courseKey]) {
              const course = courseData[courseKey];
              todayCourses.push({
                slot: slot + 1,
                subject: course.subject,
                class: course.class,
                room: course.room,
                time: this.getClassTime(slot)
              });
            }
          }
          
          this.todayCourses = todayCourses;
        } catch (error) {
          console.error('解析课程数据失败:', error);
        }
      }
    }
    
    return this.todayCourses;
  }

  // 获取下一节课
  getNextCourse() {
    const todayCourses = this.getTodayCourses();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const course of todayCourses) {
      // 简单判断时间
      if (course.time) {
        const [startTime] = course.time.split('-');
        const [hours, minutes] = startTime.split(':').map(Number);
        const courseStartTime = hours * 60 + minutes;
        
        if (courseStartTime > currentTime) {
          this.nextCourse = course;
          return course;
        }
      }
    }
    
    return null;
  }

  // 获取课程时间
  getClassTime(slot) {
    const savedData = localStorage.getItem('teacherTimetable');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        return data.classTimes && data.classTimes[slot] ? data.classTimes[slot] : '--:--';
      } catch (error) {
        return '--:--';
      }
    }
    return '--:--';
  }

  // 获取小组件数据
  getWidgetData() {
    const todayCourses = this.getTodayCourses();
    const nextCourse = this.getNextCourse();
    const currentTime = new Date().toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return {
      currentTime: currentTime,
      currentWeek: this.currentWeek,
      weekType: this.currentWeekType === 'odd' ? '单周' : '双周',
      todayCourses: todayCourses,
      nextCourse: nextCourse,
      totalCourses: todayCourses.length
    };
  }

  // 更新小组件
  updateWidget() {
    if (typeof Android !== 'undefined' && Android.updateWidget) {
      const widgetData = this.getWidgetData();
      Android.updateWidget(JSON.stringify(widgetData));
    }
  }
}

// 创建全局实例
window.widgetData = new WidgetData();

// 定时更新小组件
setInterval(() => {
  window.widgetData.updateWidget();
}, 60000); // 每分钟更新一次