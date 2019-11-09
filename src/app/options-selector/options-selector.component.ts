import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SelectedOptions } from "../datastructures";

@Component({
  selector: 'options-selector',
  templateUrl: './options-selector.component.html',
  styleUrls: ['./options-selector.component.scss']
})
export class MultiOptionsSelectorComponent {
  @Input() name: string

  @Input() multiselect: boolean = false

  @Output() select = new EventEmitter<number[]>()

  @Input() options: string[]

  @Input() maxElements = 15

  isSlicedView = false

  private _selectedArray: number[]
  private _selected: SelectedOptions
  
  @Input()
  set selected(indexes: number[]){
    this._selectedArray = indexes
    this._selected = this.mapToSelectedOptions(indexes)
  }

  get visibleOptions(){
    this.isSlicedView = this.options.length > this.maxElements
     let {ixStart, ixEnd} = this.isSlicedView 
        ? this.getSlicedViewIndex() 
        : {ixStart: 0, ixEnd: this.options.length}

    return this.options.map((v, i) => {
      return {
        index: i,
        name: v
      }
    }).slice(ixStart, ixEnd)
  }


  click(index: number){
    let marked = [index]
    if (!this.multiselect) {
    } else {
      // case 1: try to remove index
      marked = [... this._selectedArray].filter(x => x !== index)
      const isElementRemoved = marked.length < this._selectedArray.length

      // case 2: index wasn't in list. Adding.
      if (!isElementRemoved) marked.push(index)
    }
    this.select.emit(marked)
  }

  private getSlicedViewIndex = () => {
    let ixStart = 0
    let ixEnd = this.options.length

    let currentElement = !this._selectedArray ? 0 : this._selectedArray[0];
    let elementsToLeft = Math.floor(this.maxElements / 2);
    ixStart = Math.max(0, currentElement - elementsToLeft);
    ixEnd = ixStart + this.maxElements;
    if (ixStart < 0) {
      ixStart = 0;
      ixEnd = ixStart + this.maxElements;
    }
    else if (ixEnd > this.options.length) {
      ixEnd = this.options.length;
      ixStart = ixEnd - this.maxElements;
    }

    return { ixStart, ixEnd }
  }

  private mapToSelectedOptions(arr: number[]): SelectedOptions {
    if (!arr || arr.length == 0) return {}
    let data = {}
    arr.forEach(x => data[x] = true)
    return data
  }
}
