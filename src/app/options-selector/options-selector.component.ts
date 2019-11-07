import { Component, OnInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

export type MultiOptions = {[index: string]: any}
export type SelectedOptions = {[index: string]: boolean}

@Component({
  selector: 'options-selector',
  templateUrl: './options-selector.component.html',
  styleUrls: ['./options-selector.component.scss']
})
export class MultiOptionsSelectorComponent {
  @Input()
  options: MultiOptions 
  
  @Input()
  name: string

  @Input()
  multiselect: boolean = false

  @Output() 
  select = new EventEmitter<SelectedOptions>()

  private _selected: SelectedOptions = {}

  private propagateSelection(){
    this.select.emit(Object.assign({}, this._selected))
  }

  private toggleSelection(index: string){
    if (!this.multiselect){
      Object.keys(this._selected).forEach(key => this._selected[key] = false)
    }

    this._selected[index] = !this._selected[index]
    this.propagateSelection()
  }

  @Input()
  set defaultSelection(selection: string[]){
    selection.forEach(index => this._selected[index] = true)
    this.propagateSelection()
  }
}
