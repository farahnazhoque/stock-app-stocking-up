import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import type { EChartsOption } from 'echarts';

interface Tab2 {
  historical: number[];
  prediction: number;
}

@Component({
  selector: 'app-tab2.page',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  options!: EChartsOption;
  company: string = 'AAPL'; // default to apple for example
  timeFrame: string = 'next month'; // default time frame
  historicalData: number[] = [];
  prediction: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.http.post<Tab2>('http://127.0.0.1:5000/predict', { symbol: this.company, timeFrame: this.timeFrame }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'json'
    }).subscribe({
      next: (response) => {
        this.historicalData = response.historical;
        this.prediction = response.prediction;
        this.updateChart();
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });
  }
  

  updateChart(): void {
    const xAxisData = this.generateXAxisData();
    const data1 = this.historicalData;
    const data2 = new Array(data1.length - 1).fill(null).concat([this.prediction]);

    this.options = {
      legend: {
        data: ['Historical', 'Prediction'],
        align: 'left',
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        name: 'USD',
      },
      series: [
        {
          name: 'Historical',
          type: 'line',
          data: data1,
          animationDelay: idx => idx * 10,
        },
        {
          name: 'Prediction',
          type: 'line',
          data: data2,
          animationDelay: idx => idx * 10 + 100,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: idx => idx * 5,
    };
  }

  generateXAxisData(): string[] {
    // Implement logic to generate x-axis labels based on the time frame
    // This function should return an array of string labels
    let labels = [];
    let period = this.historicalData.length;
    for (let i = 0; i < period; i++) {
      labels.push(`Time ${i + 1}`);
    }
    return labels;
  }
}