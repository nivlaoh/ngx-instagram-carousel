import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
  	CommonModule,
  	FlexLayoutModule,
  	MatButtonModule,
  	MatCardModule,
  	MatChipsModule,
  	MatIconModule,
  	MatToolbarModule
  ],
  declarations: []
})
export class SharedModule { }
