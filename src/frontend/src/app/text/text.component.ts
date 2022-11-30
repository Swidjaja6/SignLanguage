import { AfterViewInit, Component, ViewChild} from '@angular/core';
@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements AfterViewInit {
  @ViewChild('predictionBox') predictionBoxRef!: any;

  constructor() { }

  ngOnInit(): void {  }

  addWord(word:any){
    this.predictionBoxRef.nativeElement.value+=` ${word}`;
  }

  ngAfterViewInit(){
  }

}