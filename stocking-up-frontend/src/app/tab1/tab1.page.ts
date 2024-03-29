import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


interface Tab1 {
  daily: number[];
}

interface DailyData {
  [key: string]: number[];
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  today: Date = new Date();
  selectedDate: string = this.today.toISOString().split('T')[0];
  companies: string[] = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'TSLA'];
  dailyData: DailyData = {}; // Use the DailyData interface here

  constructor(private http: HttpClient) {}

    ngonInit(): void {
      this.fetchData();
    }

    fetchData(): void {
      this.companies.forEach(company => {
        this.http.post<Tab1>('http://127.0.0.1:5000/daily', {
          symbol: company,
          date: this.selectedDate
        }, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          }),
          responseType: 'json'
        }).subscribe({
          next: (response) => {
            this.dailyData[company] = response.daily;
          },
          error: (error) => {
            console.error('Error:', error);
          },
        });
      });

      
    }
onDateChange(event: any): void {
    this.selectedDate = event.detail.value.split('T')[0];
    this.fetchData();
  }
} 
