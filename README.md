This is a CPU Scheduling Visualization, in here we are gonaa be showing a simulation of how each 
algorithm is being used by your device:
First-In First-Out (FIFO / FCFS)
-The Jobs are process in order at which they arrive
-No interruptions, one job must be finish to continue the rest
-Simple, long jobs may take a while to finish

Shortest Job First (SJF) – Non-Preemptive
-Select the job with the smallest burst time
-once job starts, it completes uninterrupted
-Great for minimizing waiting and turnaround time

Shortest Remaining Time First (SRTF) – Preemptive
-This always picks the job that has least remaining time
- if a shorter process arrives, it preempts the current
  
Round Robin
-each process has a fixed time slice, quantum then cycles
-this switches context after every time slice

Multilevel Feedback Queue (MLFQ)
-Mutilple queues with varied priority levels
-the process moves between queues 

Member roles/contrubutions
Balista - both members have done all equal algorithms as we were having a hard time. 
          HTML was improved based on Mascardo initial design
Mascardo - Checking of accurate simulation and improvements of HTML Desgin and flow

known bugs:
   <To Be Updated>

Output Examples:

FIFO/FCFS
<img width="612" height="603" alt="image" src="https://github.com/user-attachments/assets/2a5dd92b-9c8b-4f43-9d7f-1acfce509573" />

SJF
<img width="602" height="586" alt="image" src="https://github.com/user-attachments/assets/5ff5c938-3529-491e-b610-273631f014f3" />

SRTF
<img width="598" height="597" alt="image" src="https://github.com/user-attachments/assets/ad7f4adb-1f95-4316-8687-e847fcea0803" />

RR
<img width="616" height="595" alt="image" src="https://github.com/user-attachments/assets/9881a8f9-7ef1-4dd5-bef8-fdd851ad4996" />

MLFQ
<img width="607" height="723" alt="image" src="https://github.com/user-attachments/assets/96457b35-4ec8-4fc6-9173-b43a2c0a5fac" />


