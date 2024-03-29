import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ContentChild,
  TemplateRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { ControlValueComponent } from 'src/app/components/control-value/control-value.component';
import { MatSelectionListChange, MatList } from '@angular/material/list';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-selection-list',
  templateUrl: './selection-list.component.html',
  styleUrls: ['./selection-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectionListComponent,
      multi: true,
    },
  ],
})
export class SelectionListComponent extends ControlValueComponent<any>
  implements AfterViewInit {
  @Input()
  title: string;

  @Input()
  options: any[];

  @Input()
  idKey: string;

  @ContentChild(TemplateRef)
  itemTemplate: TemplateRef<any>;

  @ViewChild(MatList)
  listComponent: MatList;

  constructor(
    protected changeDetectorRef: ChangeDetectorRef,
    protected elementRef: ElementRef
  ) {
    super(changeDetectorRef);
  }

  ngAfterViewInit(): void {
    this.focusValue(this.value);
  }

  onSelectionChange(event: MatSelectionListChange): void {
    this.onChange(event?.option?.value);
  }

  isOptionSelected(option: any) {
    return this.idKey
      ? option[this.idKey] === this.value[this.idKey]
      : option === this.value;
  }

  focusValue(value: any) {
    if (!value) return;
    const index = this.options?.findIndex((o) =>
      this.idKey ? o[this.idKey] === value[this.idKey] : o === this.value
    );
    const element = this.elementRef.nativeElement.querySelector(
      `mat-list-option:nth-child(${index + 1})`
    ) as HTMLElement;
    element?.focus();
  }
}
