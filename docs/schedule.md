# Schedule
The `Schedule` page helps you to create schedules for data import while utilizing your previously saved mapping generated using the data import wizard.

The page shows a list of your previously created schedules along with the details on each schedule, that is; schedule type, name, description, mapping associated, creation date, date of last run, date of next run and actions that can be performed on the schedule.

|![Saved Mappings](/iwizard/sched.png =800x){.decor-shadow .radius-5 .elevation-3}|
|:--:|
| **Schedules page** |

## Creating a Schedule
To create a schedule, click the `Add Schedule` button at the top right of the schedule page. This will display a form within a modal for you to capture details required to create a schedule.

|![Saved Mappings](/iwizard/sched1.png =800x){.decor-shadow .radius-5 .elevation-3}|
|:--:|
| **Creating a schedule** |


## Schedule Management
A previously created schedule can be **edited**, **started**, **stopped** or **deleted.** Each schedule shown in the scedules list has the edit, stop, start and delete actions showed in the actions column. Clicking an action button will affect the schedule accordingly.

|![Saved Mappings](/iwizard/sched2.png =800x){.decor-shadow .radius-5 .elevation-3}|
|:--:|
| **Schedule management actions** |




## Scheduling Server
Each time you create a schedule, you provide a URL for the server where the data import scheduler is running. This URL is should expose the /create, /start, /stop API endpints.



## How the scheduling is done
