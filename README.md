This is a CPU Scheduling Visualization, in here we are gonaa be showing a simulation of how each 
algorithm is being used by your device:
  
1.First-In First-Out (FIFO / FCFS)
-The Jobs are process in order at which they arrive
-No interruptions, one job must be finish to continue the rest
-Simple, long jobs may take a while to finish
  
2. Shortest Job First (SJF) – Non-Preemptive
-Select the job with the smallest burst time
-once job starts, it completes uninterrupted
-Great for minimizing waiting and turnaround time
  
3. Shortest Remaining Time First (SRTF) – Preemptive
-This always picks the job that has least remaining time
- if a shorter process arrives, it preempts the current
    
4. Round Robin
-each process has a fixed time slice, quantum then cycles
-this switches context after every time slice
  
5.Multilevel Feedback Queue (MLFQ)
-Mutilple queues with varied priority levels
-the process moves between queues 

Member roles/contrubutions  
Mascardo - Initial Code and UI  
Balista - Cleanup, bugfix and UI improvement  

known bugs:
   To Be Added

Output Examples:

FIFO/FCFS  
<img width="612" height="603" alt="image" src="https://github.com/user-attachments/assets/2a5dd92b-9c8b-4f43-9d7f-1acfce509573" />


SJF  
<img width="602" height="586" alt="image" src="https://github.com/user-attachments/assets/5ff5c938-3529-491e-b610-273631f014f3" />


SRTF  
<img width="598" height="597" alt="image" src="https://github.com/user-attachments/assets/ad7f4adb-1f95-4316-8687-e847fcea0803" />


RR  
<img width="863" height="812" alt="image" src="https://github.com/user-attachments/assets/4779ff89-5084-4dae-9961-3e8ec1b95023" />


MLFQ  
<img width="607" height="723" alt="image" src="https://github.com/user-attachments/assets/96457b35-4ec8-4fc6-9173-b43a2c0a5fac" />



