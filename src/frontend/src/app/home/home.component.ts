import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  listLeft = ['ASL',];
  listRight = ['English',];

  sourceType: string = "ASL";
  destType: string = 'English';

  constructor() { }

  ngOnInit(): void {
  }

  swap(){
    let temp = this.listLeft;
    this.listLeft = this.listRight;
    this.listRight = temp;
    let temp1 = this.sourceType;
    this.sourceType = this.destType;
    this.destType = temp1;
  }

}
