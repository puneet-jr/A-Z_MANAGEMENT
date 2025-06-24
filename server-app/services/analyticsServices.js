import _ from "lodash";

class AdvancedAnalyticsServices{

    analyseTaskPatterns(tasks){
        if(!tasks || !Array.isArray(tasks)){
            throw new Error("Invalid tasks data provided for analysis.");
        }

        const tasksByStatus= _.groupBy(tasks,'status');

        const totalTasks= tasks.length;
        const completedTasks= tasksByStatus.completed ? tasksByStatus.completed.length : 0;

        return {
            totalTasks,
            completedTasks,
            tasksByStatus: _.mapValues(tasksByStatus, (tasks) => tasks.length)
        };
    }

    analyseProductivityByDay(tasks){  // Fixed: added 'r' in 'Productivity'
        if(!tasks || !Array.isArray(tasks)){
            throw new Error("Invalid tasks data provided for analysis.");
        }
      
        const completedTasks= tasks.filter(task=> task.status === "completed");  // Fixed: 'filer' to 'filter'

        if(completedTasks.length === 0){
            return { message: "No completed tasks found for productivity analysis." };
        }

        const pendingTasks= tasks.filter(task=> task.status==="pending");  // Fixed: 'tasks' to 'task' and removed 'tasksByStatus'

        const tasksByDay= _.groupBy(completedTasks, task=>{
            const date = new Date(task.updatedAt || task.createdAt);  // Fixed: DataTransfer to Date and used existing fields
            return date.getDay();
        });

        const dayCounts= _.mapValues(tasksByDay, (tasks) => tasks.length);
        
        const dayNames=['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const productivityByDay= _.mapKeys(dayCounts,(count,dayIndex)=> dayNames[dayIndex]);

        return {
            totalCompletedTasks: completedTasks.length,
            totalPendingTasks: pendingTasks.length,
            productivityByDay
        };
    }

    analyseTaskCompletionTime(tasks){
        if(!tasks || tasks.length===0){
            return {message: "No tasks found for analysis"};
        }

        const timedTasks= tasks.filter(task=>task.estimatedTime && task.actualTime);  // Fixed: 'tasks' to 'task'
    
        if(timedTasks.length===0){
            return{
                message:" No tasks with estimated time were found"
            };
        }

        const categorization= _.groupBy(timedTasks,task=>{  // Fixed: 'tasks' to 'task'
        const timeDifference= task.actualTime- task.estimatedTime;  // Fixed: 'tasks' to 'task'

            if(timeDifference<0){
                return 'early';
            }

            if(timeDifference===0){
                return "on-time"
            }
            else{
                return 'delayed'
            }
        });

        return{
          analyzedTasks: timedTasks.length,
    categorization: _.mapValues(categorization, group => group.length),  // Fixed: kept 'categorization'
    averageTimeDifference: _.round( _.mean(timedTasks.map(task => task.actualTime - task.estimatedTime)),2)
        }
    };
}

export default new AdvancedAnalyticsServices();