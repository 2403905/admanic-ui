import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    Output, ViewEncapsulation
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

export const CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CheckboxComponent),
    multi: true
};

@Component({
    providers: [CHECKBOX_CONTROL_VALUE_ACCESSOR],
    selector: 'adm-checkbox',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./style.scss'],
    template: `
        <div class="adm-checkbox__wrap">
            <div class="adm-checkbox__el" (click)="toggle();"></div>
            <div class="adm-checkbox__label" [class.is-required]="_required" (click)="toggle();">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    host: {
        'class': 'adm-checkbox',
        '[attr.checked]': 'checked',
        '[class.is-checked]': 'checked',
        '[attr.disabled]': 'disabled',
        '[class.is-disabled]': 'disabled',
        '[class.is-rtl]': 'rtl'
    }
})
export class CheckboxComponent {
    _checked: boolean | string;
    _required: boolean;
    _ctrl: FormControl;

    @Input() disabled: boolean;
    @Input() rtl: boolean;
    @Input() value: string;

    @Input()
    set control(ctrl: FormControl) {
        this._required = ctrl.hasError('required');
        this._ctrl = ctrl;
        console.log(this._required);
    }

    @Input()
    set checked(val: boolean | string) {
        this._checked = !!val;
    }

    get checked(): boolean | string {
        return !this.value ? this._checked : this._checked == this.value;
    }

    @Output() change: EventEmitter<boolean | string> = new EventEmitter();

    constructor(private el: ElementRef) {
    }

    writeValue(val: any) {
        this._checked = val;
        this.onChange(this._checked);
        this.onTouched();
        this.change.emit(this._checked);
    }

    toggle(): void {
        if (!this.disabled) {
            this.writeValue(!this.value ? !this._checked : this._checked == this.value ? null : this.value);
        }
    }

    onChange: Function = (_: any) => {
    };
    onTouched: Function = () => {
    };

    registerOnChange(fn: Function): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onTouched = fn;
    }
}