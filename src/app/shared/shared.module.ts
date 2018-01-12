import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatToolbarModule } from '@angular/material';
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
