import {
  NgModule,
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ElementRef,
} from '@angular/core';

// Following icons are downloaded from: https://material.io/resources/icons/?style=baseline

abstract class IconComponent implements OnInit, OnChanges {
  @Input()
  size: string = '';

  @Input()
  fill: string = '#fff';

  @ViewChild('svg') icon: SVGElement;

  constructor(protected elementRef: ElementRef) {}

  ngOnInit(): void {
    this.setStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setStyle();
  }

  protected setStyle() {
    this.elementRef.nativeElement.querySelector('svg')?.setAttribute(
      'style',
      `
      ${this.size ? `width: ${this.size}; height: ${this.size};` : ''}
      ${this.fill ? `fill: ${this.fill};` : ''}
    `
    );
  }
}

@Component({
  selector: 'app-logo-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <img
    src="data:image/png;base64,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"
  />`,
})
export class LogoIconComponent extends IconComponent {}

@NgModule({
  declarations: [LogoIconComponent],
  exports: [LogoIconComponent],
})
export class IconsModule {}
