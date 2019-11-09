import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { SelectedOptions, mapToSelectedOptions } from "../datastructures";

@Component({
  selector: 'options-selector',
  templateUrl: './options-selector.component.html',
  styleUrls: ['./options-selector.component.scss']
})
export class MultiOptionsSelectorComponent {
  visibleOptions: {index: number, name: string}[] = []
  _options: string[]

  @Input() name: string

  @Input() multiselect: boolean = false

  @Output() select = new EventEmitter<number[]>()

  @Input() maxElements = 15

  @Input()
  options: string[]
  
  isSlicedView = false

  private _selectedArray: number[]
  private _selected: SelectedOptions
  
  @Input()
  set selected(indexes: number[]){
    let options = this.options
    this._selectedArray = indexes
    this._selected = mapToSelectedOptions(indexes)

    this.isSlicedView = options.length > this.maxElements
     let {ixStart, ixEnd} = this.isSlicedView 
        ? this.getSlicedViewIndex(options.length, this._selectedArray, this.maxElements) 
        : {ixStart: 0, ixEnd: options.length}

    this.visibleOptions = options.map((v, i) => {
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

  private getSlicedViewIndex = (dataLength: number, selection: number[], maxElements: number) => {
    let ixStart = 0
    let ixEnd = dataLength

    let currentElement = !selection ? 0 : selection[0];
    let elementsToLeft = Math.floor(maxElements / 2);
    ixStart = Math.max(0, currentElement - elementsToLeft);
    ixEnd = ixStart + maxElements;
    if (ixStart < 0) {
      ixStart = 0;
      ixEnd = ixStart + maxElements;
    }
    else if (ixEnd > dataLength) {
      ixEnd = dataLength;
      ixStart = ixEnd - maxElements;
    }

    return { ixStart, ixEnd }
  }
}
