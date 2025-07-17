/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package SchedulingAlgorithm;

/**
 *
 * @author steve
 */
import java.util.*;

class Process {
    int id, arrivalTime, burstTime, remainingTime, waitingTime, turnaroundTime, completionTime;

    public Process(int id, int arrivalTime, int burstTime) {
        this.id = id;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.remainingTime = burstTime;
    }
}

public class SJF_PreEMP {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Process[] processes = new Process[n];
        
        for (int i = 0; i < n; i++) {
            int arrivalTime = sc.nextInt(), burstTime = sc.nextInt();
            processes[i] = new Process(i + 1, arrivalTime, burstTime);
        }

        Arrays.sort(processes, Comparator.comparingInt(p -> p.arrivalTime));

        int currentTime = 0, completed = 0;
        while (completed < n) {
            int idx = -1;
            for (int i = 0; i < n; i++) {
                if (processes[i].arrivalTime <= currentTime && processes[i].remainingTime > 0 && (idx == -1 || processes[i].remainingTime < processes[idx].remainingTime)) {
                    idx = i;
                }
            }
            if (idx != -1) {
                processes[idx].remainingTime--;
                currentTime++;
                if (processes[idx].remainingTime == 0) {
                    processes[idx].completionTime = currentTime;
                    processes[idx].turnaroundTime = currentTime - processes[idx].arrivalTime;
                    processes[idx].waitingTime = processes[idx].turnaroundTime - processes[idx].burstTime;
                    completed++;
                }
            } else {
                currentTime++;
            }
        }

        double totalWT = 0, totalTAT = 0;
        for (Process p : processes) {
            totalWT += p.waitingTime;
            totalTAT += p.turnaroundTime;
            System.out.println("P" + p.id + " CT: " + p.completionTime + " WT: " + p.waitingTime + " TAT: " + p.turnaroundTime);
        }
        System.out.println("Avg WT: " + totalWT / n + " Avg TAT: " + totalTAT / n);
    }
}
