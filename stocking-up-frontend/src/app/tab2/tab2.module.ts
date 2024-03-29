import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule, // Add HttpClientModule here
    ExploreContainerComponentModule,
    Tab2PageRoutingModule,
    NgxEchartsModule,
  ],
  declarations: [Tab2Page]
})
export class Tab2PageModule {}
