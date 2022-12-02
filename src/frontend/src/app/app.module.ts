import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { WebcamModule } from 'ngx-webcam';


import { AppComponent } from './app.component';
import { CameraComponent, ModelLoadingDialog } from './camera/camera.component';
import { HomeComponent } from './home/home.component';
import { TextComponent } from './text/text.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    HomeComponent,
    ModelLoadingDialog,
    TextComponent
  ],
  imports: [
    BrowserModule,
    WebcamModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatGridListModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
